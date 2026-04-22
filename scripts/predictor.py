#!/usr/bin/env python3
"""
SA Lottery AI Prediction Engine
Multi-model ensemble predictor for all SA lottery games.
"""

import os
import json
import numpy as np
import pandas as pd
from collections import Counter
from itertools import combinations
from datetime import datetime

# ---------------------------------------------------------------------------
# Game Configurations
# ---------------------------------------------------------------------------
GAMES = {
    'lotto': {
        'name': 'SA Lotto',
        'csv_file': 'sa_lotto_results_2000_2026.csv',
        'num_main': 6,
        'num_max': 52,
        'delimiter': ',',
    },
    'lotto_plus_1': {
        'name': 'Lotto Plus 1',
        'csv_file': 'lotto_plus_1_results.csv',
        'num_main': 6,
        'num_max': 52,
        'delimiter': ';',
    },
    'lotto_plus_2': {
        'name': 'Lotto Plus 2',
        'csv_file': 'lotto_plus_2_results.csv',
        'num_main': 6,
        'num_max': 52,
        'delimiter': ';',
    },
    'powerball': {
        'name': 'Powerball',
        'csv_file': 'powerball_results.csv',
        'num_main': 5,
        'num_max': 50,
        'delimiter': ';',
    },
}

SET_NAMES = [
    'BALANCED ENSEMBLE', 'RF-HEAVY', 'MARKOV-HEAVY', 'FREQ-HEAVY', 'GAP-HEAVY',
    'PAIR-HEAVY', 'TREND-FOLLOWING', 'CONTRARIAN', 'MOMENTUM', 'REGRESSION-TO-MEAN',
    'PATTERN-HUNTER', 'FREQUENCY+PAIR', 'RF+GAP FOCUS', 'MARKOV+FREQ', 'EQUAL WEIGHT',
    'AGGRESSIVE COLD', 'AGGRESSIVE HOT', 'SWING PICK', 'DEEP OVERDUE', 'SMART BLEND'
]


def load_data(csv_path, delimiter):
    """Load CSV data."""
    try:
        df = pd.read_csv(csv_path, delimiter=delimiter)
        print(f"    Loaded {len(df)} draws")
        return df
    except Exception as e:
        print(f"    Error loading CSV: {e}")
        return None


def predict_game(df, num_main, num_max, game_name):
    """Generate predictions using pure statistical models."""
    number_cols = [f'Number_{i}' for i in range(1, num_main + 1)]
    recent_row = df.iloc[0]

    all_numbers = df[number_cols].values.flatten()
    freq_counter = Counter(all_numbers)

    # Pair co-occurrence
    pair_counter = Counter()
    for _, row in df.iterrows():
        nums = sorted([int(row[c]) for c in number_cols])
        for pair in combinations(nums, 2):
            pair_counter[pair] += 1

    recent_nums = [int(recent_row[c]) for c in number_cols]

    # --- 1. MARKOV CHAIN ---
    def to_vec(row):
        v = np.zeros(num_max)
        for c in number_cols:
            n = int(row[c])
            if 1 <= n <= num_max:
                v[n-1] = 1
        return v

    tc = np.zeros((num_max, num_max))
    for i in range(min(len(df)-1, 500)):
        cv, nv = to_vec(df.iloc[i]), to_vec(df.iloc[i+1])
        active_c = np.where(cv > 0)[0]
        active_n = np.where(nv > 0)[0]
        for cn in active_c:
            for nn in active_n:
                tc[cn, nn] += 1

    tp = (tc + 0.1) / (tc.sum(axis=1, keepdims=True) + num_max * 0.1)
    rv = to_vec(recent_row)
    ms = np.zeros(num_max)
    for cn in range(num_max):
        if rv[cn]:
            ms += tp[cn]
    markov_scores = ms / (ms.sum() + 1e-10)

    # --- 2. RANDOM FOREST (statistical features) ---
    rf_scores = np.zeros(num_max)
    for num in range(1, num_max + 1):
        score = 0
        score += 0.35 * (freq_counter.get(num, 0) / max(freq_counter.values()) if freq_counter else 0)
        for idx in range(min(50, len(df))):
            if num in [int(df.iloc[idx][c]) for c in number_cols]:
                score += 0.25 * (1 - idx / 50)
                break
        gap_found = False
        for idx in range(len(df)):
            if num in [int(df.iloc[idx][c]) for c in number_cols]:
                gap = min(idx, 50)
                score += 0.20 * (gap / 50)
                gap_found = True
                break
        if not gap_found:
            score += 0.20
        for i, c in enumerate(number_cols):
            score += 0.10 * (np.sum(df[c] == num) / len(df)) * (1 - i * 0.1)
        score += 0.10 * (0.5 if num % 2 == 0 else 0.5)
        rf_scores[num-1] = score
    rf_scores /= (rf_scores.sum() + 1e-10)

    # --- 3. RECENCY-WEIGHTED FREQUENCY ---
    freq_scores = np.zeros(num_max)
    for i in range(min(200, len(df))):
        w = (200 - i) / 200
        for c in number_cols:
            n = int(df.iloc[i][c])
            if n <= num_max:
                freq_scores[n-1] += w
    freq_scores /= (freq_scores.sum() + 1e-10)

    # --- 4. GAP/OVERDUE ---
    gap_scores = np.zeros(num_max)
    for num in range(1, num_max + 1):
        gap = 0
        for idx in range(len(df)):
            if num in [int(df.iloc[idx][c]) for c in number_cols]:
                gap = min(idx, 50)
                break
        gap_scores[num-1] = gap
    gap_scores /= (gap_scores.sum() + 1e-10)

    # --- 5. PAIR CO-OCCURRENCE ---
    pair_scores = np.zeros(num_max)
    for num in range(1, num_max + 1):
        for r in recent_nums:
            if r <= num_max:
                pair_scores[num-1] += pair_counter.get(tuple(sorted([r, num])), 0)
    pair_scores /= (pair_scores.sum() + 1e-10)

    # --- 6. TEMPORAL TREND ---
    trend_scores = np.zeros(num_max)
    for i in range(min(20, len(df))):
        w = np.exp(-0.1 * i)
        for c in number_cols:
            n = int(df.iloc[i][c])
            if n <= num_max:
                trend_scores[n-1] += w
    trend_scores /= (trend_scores.sum() + 1e-10)

    # --- ENSEMBLE ---
    def norm(s):
        mn, mx = s.min(), s.max()
        return (s - mn) / (mx - mn + 1e-10)

    def top(scores, count):
        return sorted([(i+1, float(scores[i])) for i in range(num_max)], key=lambda x: x[1], reverse=True)[:count]

    # Generate 20 diverse sets
    weights_20 = [
        {'rf': 0.30, 'markov': 0.20, 'freq': 0.15, 'gap': 0.15, 'pair': 0.10, 'trend': 0.10},
        {'rf': 0.60, 'markov': 0.10, 'freq': 0.10, 'gap': 0.10, 'pair': 0.05, 'trend': 0.05},
        {'rf': 0.10, 'markov': 0.50, 'freq': 0.10, 'gap': 0.15, 'pair': 0.10, 'trend': 0.05},
        {'rf': 0.10, 'markov': 0.10, 'freq': 0.50, 'gap': 0.10, 'pair': 0.10, 'trend': 0.10},
        {'rf': 0.10, 'markov': 0.10, 'freq': 0.05, 'gap': 0.50, 'pair': 0.10, 'trend': 0.15},
        {'rf': 0.10, 'markov': 0.10, 'freq': 0.10, 'gap': 0.10, 'pair': 0.50, 'trend': 0.10},
        {'rf': 0.15, 'markov': 0.15, 'freq': 0.15, 'gap': 0.10, 'pair': 0.10, 'trend': 0.35},
        {'rf': 0.10, 'markov': 0.10, 'freq': 0.05, 'gap': 0.35, 'pair': 0.10, 'trend': 0.30},
        {'rf': 0.20, 'markov': 0.15, 'freq': 0.30, 'gap': 0.05, 'pair': 0.15, 'trend': 0.15},
        {'rf': 0.25, 'markov': 0.10, 'freq': 0.05, 'gap': 0.30, 'pair': 0.10, 'trend': 0.20},
        {'rf': 0.15, 'markov': 0.25, 'freq': 0.10, 'gap': 0.15, 'pair': 0.20, 'trend': 0.15},
        {'rf': 0.10, 'markov': 0.10, 'freq': 0.30, 'gap': 0.10, 'pair': 0.30, 'trend': 0.10},
        {'rf': 0.40, 'markov': 0.10, 'freq': 0.05, 'gap': 0.30, 'pair': 0.10, 'trend': 0.05},
        {'rf': 0.10, 'markov': 0.35, 'freq': 0.30, 'gap': 0.10, 'pair': 0.10, 'trend': 0.05},
        {'rf': 0.17, 'markov': 0.17, 'freq': 0.17, 'gap': 0.17, 'pair': 0.16, 'trend': 0.16},
        {'rf': 0.05, 'markov': 0.05, 'freq': 0.05, 'gap': 0.60, 'pair': 0.10, 'trend': 0.15},
        {'rf': 0.35, 'markov': 0.15, 'freq': 0.35, 'gap': 0.05, 'pair': 0.05, 'trend': 0.05},
        {'rf': 0.20, 'markov': 0.20, 'freq': 0.15, 'gap': 0.20, 'pair': 0.15, 'trend': 0.10},
        {'rf': 0.05, 'markov': 0.05, 'freq': 0.05, 'gap': 0.70, 'pair': 0.10, 'trend': 0.05},
        {'rf': 0.25, 'markov': 0.20, 'freq': 0.15, 'gap': 0.15, 'pair': 0.15, 'trend': 0.10},
    ]

    sets = []
    for i, name in enumerate(SET_NAMES):
        w = weights_20[i]
        scores = (
            w['rf'] * norm(rf_scores) + w['markov'] * norm(markov_scores) +
            w['freq'] * norm(freq_scores) + w['gap'] * norm(gap_scores) +
            w['pair'] * norm(pair_scores) + w['trend'] * norm(trend_scores)
        )
        nums = sorted([n for n, _ in top(scores, num_main)])
        sets.append({'name': name, 'numbers': nums})

    # Main ensemble
    w = {'rf': 0.30, 'markov': 0.20, 'freq': 0.15, 'gap': 0.15, 'pair': 0.10, 'trend': 0.10}
    ensemble_scores = (
        w['rf'] * norm(rf_scores) + w['markov'] * norm(markov_scores) +
        w['freq'] * norm(freq_scores) + w['gap'] * norm(gap_scores) +
        w['pair'] * norm(pair_scores) + w['trend'] * norm(trend_scores)
    )

    return {
        'game': game_name,
        'num_main': num_main,
        'num_max': num_max,
        'last_draw': recent_nums,
        'last_bonus': int(recent_row['Bonus_Ball']),
        'sets': sets,
        'primary': sets[0]['numbers'],
        'predicted_bonus': int(Counter(df['Bonus_Ball']).most_common(1)[0][0]),
        'confidence': {str(i+1): round(float(ensemble_scores[i]), 4) for i in range(num_max)},
        'frequency': {str(num): int(freq_counter.get(num, 0)) for num in range(1, num_max + 1)},
        'hot_numbers': [int(n) for n, _ in freq_counter.most_common(15)],
        'cold_numbers': [int(n) for n, _ in freq_counter.most_common()[-15:]],
        'recent_draws': [
            {'date': str(df.iloc[i]['Date']), 'numbers': [int(df.iloc[i][c]) for c in number_cols],
             'bonus': int(df.iloc[i]['Bonus_Ball'])}
            for i in range(min(10, len(df)))
        ]
    }


def run_predictions(data_dir, output_path):
    """Run predictions for all games."""
    print("\n" + "=" * 60)
    print("  RUNNING AI PREDICTIONS")
    print("=" * 60)

    all_data = {
        'generated': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'jackpots': {
            'lotto': 'R86,000,000',
            'lotto_plus_1': 'R500,000',
            'lotto_plus_2': 'R500,000',
            'powerball': 'R42,000,000',
        }
    }

    for game_key, config in GAMES.items():
        print(f"\n  [{config['name']}]")
        csv_path = os.path.join(data_dir, config['csv_file'])

        if not os.path.exists(csv_path):
            print(f"    ! CSV not found: {csv_path}")
            continue

        df = load_data(csv_path, config['delimiter'])
        if df is None:
            continue

        result = predict_game(df, config['num_main'], config['num_max'], config['name'])
        all_data[game_key] = result

        print(f"    Primary: {result['primary']}")
        print(f"    Bonus: {result['predicted_bonus']}")
        print(f"    Hot: {result['hot_numbers'][:5]}")
        print(f"    Cold: {result['cold_numbers'][:5]}")

    # Save predictions
    with open(output_path, 'w') as f:
        json.dump(all_data, f, indent=2)

    print("\n" + "=" * 60)
    print(f"  Predictions saved to: {output_path}")
    print("=" * 60)

    return all_data


if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', 'public', 'data')
    output_path = os.path.join(script_dir, '..', 'public', 'predictions.json')
    run_predictions(data_dir, output_path)
