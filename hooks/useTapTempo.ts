import { useState } from 'react';
import { MIN_BPM, MAX_BPM } from '../constants';

export const useTapTempo = (onAnalysisUpdate: (data: { bpm: number | null, count: number }) => void) => {
  const [taps, setTaps] = useState<number[]>([]);

  const handleTap = () => {
    const now = performance.now();
    let newTaps = [...taps];

    // Clear taps if it's been a while (2 seconds) to start a new sequence
    if (newTaps.length > 0 && now - newTaps[newTaps.length - 1] > 2000) {
      newTaps = [];
    }

    newTaps.push(now);
    setTaps(newTaps);
    
    // Calculate Beat Count (Bar Length) based on total taps in this sequence
    const count = newTaps.length;

    // Calculate BPM
    let bpm: number | null = null;
    
    if (newTaps.length >= 2) {
      // Use only the last 5 taps for BPM stability/responsiveness
      const recentTaps = newTaps.slice(-5);
      
      const intervals = [];
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1]);
      }

      // Average interval
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Calculate BPM
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Constraint check
      if (calculatedBpm >= MIN_BPM && calculatedBpm <= MAX_BPM) {
        bpm = calculatedBpm;
      }
    }

    // Return both the calculated BPM (if enough taps) and the raw count
    onAnalysisUpdate({ bpm, count });
  };

  return { handleTap };
};