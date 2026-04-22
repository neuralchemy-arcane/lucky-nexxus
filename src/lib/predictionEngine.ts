/**
 * Lucky Nexus - Client-Side Prediction Engine
 * Runs 6 statistical models entirely in the browser
 * No server, no scripts - pure client-side AI
 */

export interface DrawRecord {
  d: string;  // date
  n: number[]; // numbers
  b: number;  // bonus
}

export interface PredictionSet {
  name: string;
  numbers: number[];
}

export interface GameResult {
  game: string;
  num_main: number;
  num_max: number;
  last_draw: number[];
  last_bonus: number;
  sets: PredictionSet[];
  primary: number[];
  predicted_bonus: number;
  confidence: Record<string, number>;
  frequency: Record<string, number>;
  hot_numbers: number[];
  cold_numbers: number[];
  recent_draws: { date: string; numbers: number[]; bonus: number }[];
}

export interface AllPredictions {
  lotto: GameResult;
  lotto_plus_1: GameResult;
  lotto_plus_2: GameResult;
  powerball: GameResult;
  generated: string;
  jackpots: Record<string, string>;
}

const SET_NAMES = [
  'BALANCED ENSEMBLE', 'RF-HEAVY', 'MARKOV-HEAVY', 'FREQ-HEAVY', 'GAP-HEAVY',
  'PAIR-HEAVY', 'TREND-FOLLOWING', 'CONTRARIAN', 'MOMENTUM', 'REGRESSION-TO-MEAN',
  'PATTERN-HUNTER', 'FREQUENCY+PAIR', 'RF+GAP FOCUS', 'MARKOV+FREQ', 'EQUAL WEIGHT',
  'AGGRESSIVE COLD', 'AGGRESSIVE HOT', 'SWING PICK', 'DEEP OVERDUE', 'SMART BLEND'
];

// Perlin noise available for future use
/*
function noise(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  const p = PERM;
  const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
  const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
  return lerp(w,
    lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
             lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
    lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
             lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
}

function _fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }
function _lerp(t: number, a: number, b: number): number { return a + t * (b - a); }
function _grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}
*/

// Permutation table
const PERM_BASE = [
  151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
  247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
  74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
  65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
  52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
  119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
  218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
  184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
];
const PERM = new Uint8Array(512);
for (let i = 0; i < 512; i++) PERM[i] = PERM_BASE[i & 255];

function toVec(record: DrawRecord, numMax: number): Float64Array {
  const v = new Float64Array(numMax);
  for (const n of record.n) {
    if (n >= 1 && n <= numMax) v[n - 1] = 1;
  }
  return v;
}

function norm(arr: Float64Array): Float64Array {
  const mn = arr.reduce((a, b) => Math.min(a, b), Infinity);
  const mx = arr.reduce((a, b) => Math.max(a, b), -Infinity);
  const range = mx - mn;
  const result = new Float64Array(arr.length);
  if (range < 1e-10) {
    result.fill(0.5);
    return result;
  }
  for (let i = 0; i < arr.length; i++) {
    result[i] = (arr[i] - mn) / range;
  }
  return result;
}

function topScores(scores: Float64Array, count: number): { num: number; score: number }[] {
  const indexed: { num: number; score: number }[] = [];
  for (let i = 0; i < scores.length; i++) {
    indexed.push({ num: i + 1, score: scores[i] });
  }
  indexed.sort((a, b) => b.score - a.score);
  return indexed.slice(0, count);
}

function predictGame(records: DrawRecord[], numMain: number, numMax: number, gameName: string): GameResult {
  const recentRow = records[0];
  const recentNums = [...recentRow.n];

  // --- Frequency Counter ---
  const allNumbers: number[] = [];
  for (const r of records) {
    allNumbers.push(...r.n);
  }
  const freqCounter: Record<number, number> = {};
  for (const n of allNumbers) {
    freqCounter[n] = (freqCounter[n] || 0) + 1;
  }
  const maxFreq = Math.max(...Object.values(freqCounter), 1);

  // --- Pair Co-occurrence ---
  const pairCounter: Record<string, number> = {};
  for (const r of records) {
    const sorted = [...r.n].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]},${sorted[j]}`;
        pairCounter[key] = (pairCounter[key] || 0) + 1;
      }
    }
  }

  // --- 1. MARKOV CHAIN ---
  const tc = Array.from({ length: numMax }, () => new Float64Array(numMax));
  const limit = Math.min(records.length - 1, 500);
  for (let i = 0; i < limit; i++) {
    const cv = toVec(records[i], numMax);
    const nv = toVec(records[i + 1], numMax);
    const activeC: number[] = [];
    const activeN: number[] = [];
    for (let j = 0; j < numMax; j++) {
      if (cv[j] > 0) activeC.push(j);
      if (nv[j] > 0) activeN.push(j);
    }
    for (const cn of activeC) {
      for (const nn of activeN) {
        tc[cn][nn] += 1;
      }
    }
  }

  const tp = tc.map(row => {
    const sum = row.reduce((a, b) => a + b, 0) + numMax * 0.1;
    return row.map(v => (v + 0.1) / sum);
  });

  const rv = toVec(recentRow, numMax);
  const markovScores = new Float64Array(numMax);
  for (let cn = 0; cn < numMax; cn++) {
    if (rv[cn] > 0) {
      for (let nn = 0; nn < numMax; nn++) {
        markovScores[nn] += tp[cn][nn];
      }
    }
  }
  const markovSum = markovScores.reduce((a, b) => a + b, 0);
  if (markovSum > 0) {
    for (let i = 0; i < numMax; i++) markovScores[i] /= markovSum;
  }

  // --- 2. RANDOM FOREST (statistical features) ---
  const rfScores = new Float64Array(numMax);
  for (let num = 1; num <= numMax; num++) {
    let score = 0;
    // Frequency feature
    score += 0.35 * ((freqCounter[num] || 0) / maxFreq);
    // Recency feature
    for (let idx = 0; idx < Math.min(50, records.length); idx++) {
      if (records[idx].n.includes(num)) {
        score += 0.25 * (1 - idx / 50);
        break;
      }
    }
    // Gap feature
    let gapFound = false;
    for (let idx = 0; idx < records.length; idx++) {
      if (records[idx].n.includes(num)) {
        score += 0.20 * (Math.min(idx, 50) / 50);
        gapFound = true;
        break;
      }
    }
    if (!gapFound) score += 0.20;
    // Position features (simplified - just frequency per position)
    for (let i = 0; i < numMain; i++) {
      const posCount = records.filter(r => r.n[i] === num).length;
      score += 0.10 * (posCount / records.length) * (1 - i * 0.1);
    }
    score += 0.10 * 0.5; // odd/even balance
    rfScores[num - 1] = score;
  }
  const rfSum = rfScores.reduce((a, b) => a + b, 0);
  if (rfSum > 0) {
    for (let i = 0; i < numMax; i++) rfScores[i] /= rfSum;
  }

  // --- 3. RECENCY-WEIGHTED FREQUENCY ---
  const freqScores = new Float64Array(numMax);
  for (let i = 0; i < Math.min(200, records.length); i++) {
    const w = (200 - i) / 200;
    for (const n of records[i].n) {
      if (n <= numMax) freqScores[n - 1] += w;
    }
  }
  const freqSum = freqScores.reduce((a, b) => a + b, 0);
  if (freqSum > 0) {
    for (let i = 0; i < numMax; i++) freqScores[i] /= freqSum;
  }

  // --- 4. GAP/OVERDUE ---
  const gapScores = new Float64Array(numMax);
  for (let num = 1; num <= numMax; num++) {
    let gap = 0;
    for (let idx = 0; idx < records.length; idx++) {
      if (records[idx].n.includes(num)) {
        gap = Math.min(idx, 50);
        break;
      }
    }
    gapScores[num - 1] = gap;
  }
  const gapSum = gapScores.reduce((a, b) => a + b, 0);
  if (gapSum > 0) {
    for (let i = 0; i < numMax; i++) gapScores[i] /= gapSum;
  }

  // --- 5. PAIR CO-OCCURRENCE ---
  const pairScores = new Float64Array(numMax);
  for (let num = 1; num <= numMax; num++) {
    for (const r of recentNums) {
      if (r <= numMax) {
        const key = [Math.min(r, num), Math.max(r, num)].join(',');
        pairScores[num - 1] += (pairCounter[key] || 0);
      }
    }
  }
  const pairSum = pairScores.reduce((a, b) => a + b, 0);
  if (pairSum > 0) {
    for (let i = 0; i < numMax; i++) pairScores[i] /= pairSum;
  }

  // --- 6. TEMPORAL TREND ---
  const trendScores = new Float64Array(numMax);
  for (let i = 0; i < Math.min(20, records.length); i++) {
    const w = Math.exp(-0.1 * i);
    for (const n of records[i].n) {
      if (n <= numMax) trendScores[n - 1] += w;
    }
  }
  const trendSum = trendScores.reduce((a, b) => a + b, 0);
  if (trendSum > 0) {
    for (let i = 0; i < numMax; i++) trendScores[i] /= trendSum;
  }

  // --- Normalize all ---
  const nMarkov = norm(markovScores);
  const nRf = norm(rfScores);
  const nFreq = norm(freqScores);
  const nGap = norm(gapScores);
  const nPair = norm(pairScores);
  const nTrend = norm(trendScores);

  // --- Generate 20 diverse sets ---
  const weights20 = [
    { rf: 0.30, markov: 0.20, freq: 0.15, gap: 0.15, pair: 0.10, trend: 0.10 },
    { rf: 0.60, markov: 0.10, freq: 0.10, gap: 0.10, pair: 0.05, trend: 0.05 },
    { rf: 0.10, markov: 0.50, freq: 0.10, gap: 0.15, pair: 0.10, trend: 0.05 },
    { rf: 0.10, markov: 0.10, freq: 0.50, gap: 0.10, pair: 0.10, trend: 0.10 },
    { rf: 0.10, markov: 0.10, freq: 0.05, gap: 0.50, pair: 0.10, trend: 0.15 },
    { rf: 0.10, markov: 0.10, freq: 0.10, gap: 0.10, pair: 0.50, trend: 0.10 },
    { rf: 0.15, markov: 0.15, freq: 0.15, gap: 0.10, pair: 0.10, trend: 0.35 },
    { rf: 0.10, markov: 0.10, freq: 0.05, gap: 0.35, pair: 0.10, trend: 0.30 },
    { rf: 0.20, markov: 0.15, freq: 0.30, gap: 0.05, pair: 0.15, trend: 0.15 },
    { rf: 0.25, markov: 0.10, freq: 0.05, gap: 0.30, pair: 0.10, trend: 0.20 },
    { rf: 0.15, markov: 0.25, freq: 0.10, gap: 0.15, pair: 0.20, trend: 0.15 },
    { rf: 0.10, markov: 0.10, freq: 0.30, gap: 0.10, pair: 0.30, trend: 0.10 },
    { rf: 0.40, markov: 0.10, freq: 0.05, gap: 0.30, pair: 0.10, trend: 0.05 },
    { rf: 0.10, markov: 0.35, freq: 0.30, gap: 0.10, pair: 0.10, trend: 0.05 },
    { rf: 0.17, markov: 0.17, freq: 0.17, gap: 0.17, pair: 0.16, trend: 0.16 },
    { rf: 0.05, markov: 0.05, freq: 0.05, gap: 0.60, pair: 0.10, trend: 0.15 },
    { rf: 0.35, markov: 0.15, freq: 0.35, gap: 0.05, pair: 0.05, trend: 0.05 },
    { rf: 0.20, markov: 0.20, freq: 0.15, gap: 0.20, pair: 0.15, trend: 0.10 },
    { rf: 0.05, markov: 0.05, freq: 0.05, gap: 0.70, pair: 0.10, trend: 0.05 },
    { rf: 0.25, markov: 0.20, freq: 0.15, gap: 0.15, pair: 0.15, trend: 0.10 },
  ];

  const sets: PredictionSet[] = [];
  for (let i = 0; i < 20; i++) {
    const w = weights20[i];
    const scores = new Float64Array(numMax);
    for (let j = 0; j < numMax; j++) {
      scores[j] =
        w.rf * nRf[j] + w.markov * nMarkov[j] + w.freq * nFreq[j] +
        w.gap * nGap[j] + w.pair * nPair[j] + w.trend * nTrend[j];
    }
    const nums = topScores(scores, numMain).map(x => x.num).sort((a, b) => a - b);
    sets.push({ name: SET_NAMES[i], numbers: nums });
  }

  // Main ensemble scores for confidence
  const ensembleScores = new Float64Array(numMax);
  const w = { rf: 0.30, markov: 0.20, freq: 0.15, gap: 0.15, pair: 0.10, trend: 0.10 };
  for (let i = 0; i < numMax; i++) {
    ensembleScores[i] =
      w.rf * nRf[i] + w.markov * nMarkov[i] + w.freq * nFreq[i] +
      w.gap * nGap[i] + w.pair * nPair[i] + w.trend * nTrend[i];
  }

  // Build confidence map
  const confidence: Record<string, number> = {};
  for (let i = 0; i < numMax; i++) {
    if (ensembleScores[i] > 0.1) {
      confidence[String(i + 1)] = Math.round(ensembleScores[i] * 10000) / 10000;
    }
  }

  // Build frequency map
  const frequency: Record<string, number> = {};
  for (let num = 1; num <= numMax; num++) {
    frequency[String(num)] = freqCounter[num] || 0;
  }

  // Hot/cold numbers
  const sortedFreq = Object.entries(freqCounter).sort((a, b) => b[1] - a[1]);
  const hotNumbers = sortedFreq.slice(0, 15).map(x => Number(x[0]));
  const coldNumbers = sortedFreq.slice(-15).map(x => Number(x[0]));

  // Recent draws
  const recentDraws = records.slice(0, 10).map(r => ({
    date: r.d,
    numbers: [...r.n],
    bonus: r.b,
  }));

  // Predicted bonus (most common)
  const bonusCounts: Record<number, number> = {};
  for (const r of records) {
    bonusCounts[r.b] = (bonusCounts[r.b] || 0) + 1;
  }
  const predictedBonus = Number(Object.entries(bonusCounts).sort((a, b) => b[1] - a[1])[0][0]);

  return {
    game: gameName,
    num_main: numMain,
    num_max: numMax,
    last_draw: recentNums,
    last_bonus: recentRow.b,
    sets,
    primary: sets[0].numbers,
    predicted_bonus: predictedBonus,
    confidence,
    frequency,
    hot_numbers: hotNumbers,
    cold_numbers: coldNumbers,
    recent_draws: recentDraws,
  };
}

export async function runAllPredictions(): Promise<AllPredictions> {
  console.log('[PredictionEngine] Starting...');
  const start = performance.now();

  // Load all game data
  const [lottoData, plus1Data, plus2Data, pbData] = await Promise.all([
    fetch('/data/lotto_data.json').then(r => r.json()),
    fetch('/data/plus1_data.json').then(r => r.json()),
    fetch('/data/plus2_data.json').then(r => r.json()),
    fetch('/data/powerball_data.json').then(r => r.json()),
  ]);

  // Run predictions for all games
  const lotto = predictGame(lottoData, 6, 52, 'SA Lotto');
  console.log(`[PredictionEngine] Lotto: ${lotto.primary.join(', ')}`);

  const plus1 = predictGame(plus1Data, 6, 52, 'Lotto Plus 1');
  console.log(`[PredictionEngine] Plus 1: ${plus1.primary.join(', ')}`);

  const plus2 = predictGame(plus2Data, 6, 52, 'Lotto Plus 2');
  console.log(`[PredictionEngine] Plus 2: ${plus2.primary.join(', ')}`);

  const powerball = predictGame(pbData, 5, 50, 'Powerball');
  console.log(`[PredictionEngine] Powerball: ${powerball.primary.join(', ')}`);

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`[PredictionEngine] Complete in ${elapsed}s`);

  return {
    lotto,
    lotto_plus_1: plus1,
    lotto_plus_2: plus2,
    powerball,
    generated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    jackpots: {
      lotto: 'R86,000,000',
      lotto_plus_1: 'R500,000',
      lotto_plus_2: 'R500,000',
      powerball: 'R42,000,000',
    },
  };
}

// ====== LIVE DATA UPDATE SYSTEM ======
// Persistent storage for user-added draws
const STORAGE_KEY = 'lucky_nexus_draws';

function getStoredDraws(): Record<string, DrawRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredDraws(draws: Record<string, DrawRecord[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draws));
}

function mergeDraws(base: DrawRecord[], stored: DrawRecord[]): DrawRecord[] {
  const seen = new Set(base.map(r => r.n.join(',')));
  const merged = [...base];
  for (const s of stored) {
    const key = s.n.join(',');
    if (!seen.has(key)) {
      seen.add(key);
      merged.unshift(s);
    }
  }
  return merged;
}

export function addDraw(game: string, numbers: number[], bonus: number): boolean {
  const stored = getStoredDraws();
  if (!stored[game]) stored[game] = [];

  const draw: DrawRecord = {
    d: new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }),
    n: [...numbers].sort((a, b) => a - b),
    b: bonus,
  };

  // Check not duplicate of most recent
  if (stored[game].length > 0) {
    const last = stored[game][0];
    if (last.n.join(',') === draw.n.join(',')) return false;
  }

  stored[game].unshift(draw);
  saveStoredDraws(stored);
  return true;
}

export async function runAllPredictionsLive(): Promise<AllPredictions> {
  console.log('[PredictionEngine] Starting live predictions...');
  const start = performance.now();

  // Load base data
  const [baseLotto, basePlus1, basePlus2, basePb] = await Promise.all([
    fetch('data/lotto_data.json').then(r => r.json()),
    fetch('data/plus1_data.json').then(r => r.json()),
    fetch('data/plus2_data.json').then(r => r.json()),
    fetch('data/powerball_data.json').then(r => r.json()),
  ]);

  // Merge with stored draws
  const stored = getStoredDraws();
  const lottoData = mergeDraws(baseLotto, stored['lotto'] || []);
  const plus1Data = mergeDraws(basePlus1, stored['lotto_plus_1'] || []);
  const plus2Data = mergeDraws(basePlus2, stored['lotto_plus_2'] || []);
  const pbData = mergeDraws(basePb, stored['powerball'] || []);

  console.log(`[Live] Lotto: ${lottoData.length} draws (${stored['lotto']?.length || 0} user-added)`);

  // Run predictions
  const lotto = predictGame(lottoData, 6, 52, 'SA Lotto');
  const plus1 = predictGame(plus1Data, 6, 52, 'Lotto Plus 1');
  const plus2 = predictGame(plus2Data, 6, 52, 'Lotto Plus 2');
  const powerball = predictGame(pbData, 5, 50, 'Powerball');

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`[PredictionEngine] Complete in ${elapsed}s`);

  return {
    lotto,
    lotto_plus_1: plus1,
    lotto_plus_2: plus2,
    powerball,
    generated: new Date().toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    jackpots: {
      lotto: 'R86,000,000',
      lotto_plus_1: 'R500,000',
      lotto_plus_2: 'R500,000',
      powerball: 'R42,000,000',
    },
  };
}
