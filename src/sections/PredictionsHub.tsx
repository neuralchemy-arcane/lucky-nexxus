import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePredictions, type GamePrediction } from '../hooks/usePredictions';
import { Sparkles, Trophy, Calendar, Hash, RefreshCw } from 'lucide-react';
import DrawEntry from '../components/DrawEntry';

gsap.registerPlugin(ScrollTrigger);

interface GameConfig {
  key: string;
  displayName: string;
  jackpot: string;
  nextDraw: string;
  color: string;
  gradient: string;
}

const gameConfigs: GameConfig[] = [
  {
    key: 'lotto',
    displayName: 'SA Lotto',
    jackpot: 'R86,000,000',
    nextDraw: '23 Apr 2026',
    color: '#66FCF1',
    gradient: 'linear-gradient(135deg, #66FCF1, #45A29E)',
  },
  {
    key: 'lotto_plus_1',
    displayName: 'Lotto Plus 1',
    jackpot: 'R500,000',
    nextDraw: '23 Apr 2026',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
  },
  {
    key: 'lotto_plus_2',
    displayName: 'Lotto Plus 2',
    jackpot: 'R500,000',
    nextDraw: '23 Apr 2026',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308, #facc15)',
  },
  {
    key: 'powerball',
    displayName: 'Powerball',
    jackpot: 'R42,000,000',
    nextDraw: '22 Apr 2026',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
  },
];

function NumberReveal({ numbers, bonus, color, delay = 0 }: { numbers: number[]; bonus: number; color: string; delay?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const balls = container.querySelectorAll('.num-ball');
    gsap.fromTo(
      balls,
      { rotateY: 90, opacity: 0, scale: 0.5 },
      {
        rotateY: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.7)',
        delay: delay,
        scrollTrigger: {
          trigger: container,
          start: 'top 90%',
        },
      }
    );
  }, [delay]);

  return (
    <div ref={containerRef} className="flex flex-wrap gap-3 justify-center">
      {numbers.map((num, i) => (
        <div
          key={i}
          className="num-ball"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #1F2833 0%, #2A3A4B 100%)',
            border: `2px solid ${color}`,
            color: color,
            boxShadow: `0 0 10px ${color}40`,
            transformStyle: 'preserve-3d',
          }}
        >
          {num}
        </div>
      ))}
      <div
        className="num-ball bonus-ball"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: '1.1rem',
          background: 'linear-gradient(135deg, #2d1f33 0%, #4a2a4b 100%)',
          border: '2px solid #ec4899',
          color: '#f472b6',
          boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)',
        }}
      >
        {bonus}
      </div>
    </div>
  );
}

function PredictionCard({
  config,
  prediction,
  index,
}: {
  config: GameConfig;
  prediction: GamePrediction;
  index: number;
}) {
  const [showAllSets, setShowAllSets] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(
      card,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
      }
    );
  }, []);

  const confidence = Math.round(
    prediction.primary.reduce((sum, num) => {
      return sum + (prediction.confidence[num.toString()] || 0);
    }, 0) / prediction.primary.length * 100
  );

  return (
    <div
      ref={cardRef}
      className="prediction-card p-6 md:p-8"
      style={{
        background: 'rgba(11, 12, 16, 0.85)',
        border: '1px solid #2A3A4B',
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={16} style={{ color: config.color }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: config.color }}>
              {config.displayName}
            </span>
          </div>
          <h3
            className="text-3xl font-bold"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: config.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {config.jackpot}
          </h3>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1" style={{ color: '#8A95A5' }}>
            <Calendar size={12} />
            <span className="text-xs">Next Draw</span>
          </div>
          <span className="text-sm font-mono" style={{ color: '#C5C6C7' }}>
            {config.nextDraw}
          </span>
        </div>
      </div>

      {/* Last Draw */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(31, 40, 51, 0.4)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Hash size={12} style={{ color: '#8A95A5' }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: '#8A95A5' }}>
            Last Draw: {prediction.last_draw.join(', ')} + {prediction.last_bonus}
          </span>
        </div>
      </div>

      {/* Primary Prediction */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} style={{ color: config.color }} />
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: '#C5C6C7' }}>
            AI Primary Prediction
          </span>
        </div>
        <NumberReveal
          numbers={prediction.primary}
          bonus={prediction.predicted_bonus}
          color={config.color}
          delay={index * 0.3}
        />
      </div>

      {/* Confidence Badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="pulse-badge"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="pulse-gradient" />
          <span className="relative z-10 text-xs font-mono" style={{ color: '#C5C6C7' }}>
            AI Confidence: {confidence}%
          </span>
        </div>
        <button
          onClick={() => setShowAllSets(!showAllSets)}
          className="text-xs font-medium uppercase tracking-wider transition-colors hover:opacity-80"
          style={{ color: config.color }}
        >
          {showAllSets ? 'Hide' : 'View'} 20 Sets
        </button>
      </div>

      {/* All 20 Sets */}
      {showAllSets && (
        <div
          className="mt-4 pt-4 border-t overflow-y-auto max-h-96"
          style={{ borderColor: '#2A3A4B' }}
        >
          <div className="space-y-2">
            {prediction.sets.map((set, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono w-6" style={{ color: '#8A95A5' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex gap-1.5">
                    {set.numbers.map((num) => (
                      <span
                        key={num}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono"
                        style={{
                          background: 'rgba(31, 40, 51, 0.8)',
                          border: `1px solid ${config.color}40`,
                          color: config.color,
                        }}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs" style={{ color: '#8A95A5' }}>
                  {set.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PredictionsHub() {
  const { data, loading, error, refresh, isAutoRefreshing, addNewDraw } = usePredictions();
  const sectionRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <section
        id="predictions"
        ref={sectionRef}
        className="relative z-10 py-24 px-4 flex items-center justify-center"
        style={{ minHeight: '60vh' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: '#66FCF1', borderTopColor: 'transparent' }}
          />
          <p className="text-lg font-mono" style={{ color: '#8A95A5' }}>
            Running 6-Model Chrono-Probability Engine...
          </p>
          <p className="text-sm mt-2" style={{ color: '#45A29E' }}>
            Markov Chain + Random Forest + Frequency + Gap + Pair + Trend
          </p>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section id="predictions" className="relative z-10 py-24 px-4">
        <div className="text-center">
          <p className="text-lg" style={{ color: '#ef4444' }}>
            Error: {error}
          </p>
          <button
            onClick={refresh}
            className="mt-4 px-6 py-2 rounded-full text-sm font-medium"
            style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid #66FCF1', color: '#66FCF1' }}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="predictions" ref={sectionRef} className="relative z-10 py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#C5C6C7' }}
          >
            Upcoming Draws
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-4" style={{ color: '#8A95A5' }}>
            AI-generated predictions computed live in your browser using
            6 statistical models on 26 years of historical data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {data?.generated && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.2)' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#66FCF1' }} />
                <span className="text-xs font-mono" style={{ color: '#66FCF1' }}>
                  Computed: {data.generated}
                </span>
              </div>
            )}
            <button
              onClick={refresh}
              disabled={isAutoRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                background: isAutoRefreshing ? 'rgba(34, 197, 94, 0.1)' : 'rgba(102, 252, 241, 0.1)',
                border: `1px solid ${isAutoRefreshing ? 'rgba(34, 197, 94, 0.3)' : 'rgba(102, 252, 241, 0.3)'}`,
                color: isAutoRefreshing ? '#22c55e' : '#66FCF1',
              }}
            >
              <RefreshCw size={12} className={isAutoRefreshing ? 'animate-spin' : ''} />
              {isAutoRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-xs font-mono" style={{ color: '#22c55e' }}>
                Auto-refreshes every 30 min
              </span>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <DrawEntry onAddDraw={addNewDraw} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {gameConfigs.map((config, index) => {
            const prediction = data[config.key as keyof typeof data] as GamePrediction;
            if (!prediction) return null;
            return (
              <PredictionCard
                key={config.key}
                config={config}
                prediction={prediction}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
