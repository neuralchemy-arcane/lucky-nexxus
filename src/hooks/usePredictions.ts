import { useState, useEffect, useCallback, useRef } from 'react';
import { runAllPredictionsLive, addDraw } from '../lib/predictionEngine';

export interface PredictionSet {
  name: string;
  numbers: number[];
}

export interface RecentDraw {
  date: string;
  numbers: number[];
  bonus: number;
}

export interface GamePrediction {
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
  recent_draws: RecentDraw[];
}

export interface PredictionData {
  lotto: GamePrediction;
  lotto_plus_1: GamePrediction;
  lotto_plus_2: GamePrediction;
  powerball: GamePrediction;
  generated: string;
  jackpots: {
    lotto: string;
    lotto_plus_1: string;
    lotto_plus_2: string;
    powerball: string;
  };
}

export function usePredictions() {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runPredictions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setIsAutoRefreshing(true);

    try {
      const result = await runAllPredictionsLive();
      setData(result as PredictionData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsAutoRefreshing(false);
    }
  }, []);

  // Run predictions on mount
  useEffect(() => {
    runPredictions();
  }, [runPredictions]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      console.log('[AutoRefresh] Re-running predictions...');
      runPredictions(true);
    }, 30 * 60 * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [runPredictions]);

  // Manual refresh
  const refresh = useCallback(() => {
    runPredictions(false);
  }, [runPredictions]);

  // Add new draw and re-run predictions
  const addNewDraw = useCallback((game: string, numbers: number[], bonus: number) => {
    const added = addDraw(game, numbers, bonus);
    if (added) {
      runPredictions(false);
    }
    return added;
  }, [runPredictions]);

  return { data, loading, error, refresh, isAutoRefreshing, addNewDraw };
}
