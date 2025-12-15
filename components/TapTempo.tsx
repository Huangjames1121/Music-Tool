import React, { useState, useEffect } from 'react';
import { Hand } from 'lucide-react';

interface TapTempoProps {
  onBpmChange: (bpm: number) => void;
}

const TapTempo: React.FC<TapTempoProps> = ({ onBpmChange }) => {
  const [taps, setTaps] = useState<number[]>([]);

  const handleTap = () => {
    const now = performance.now();
    
    // Clear taps if it's been a while (2 seconds)
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      setTaps([now]);
      return;
    }

    const newTaps = [...taps, now];
    
    // Keep last 5 taps for average
    if (newTaps.length > 5) {
      newTaps.shift();
    }
    setTaps(newTaps);

    if (newTaps.length >= 2) {
      // Calculate intervals
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      
      // Average interval
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // Calculate BPM
      const calculatedBpm = Math.round(60000 / avgInterval);
      
      // Constraint check
      if (calculatedBpm >= 30 && calculatedBpm <= 300) {
        onBpmChange(calculatedBpm);
      }
    }
  };

  return (
    <button
      onClick={handleTap}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-xl transition-all border border-slate-600 shadow-lg w-full sm:w-auto"
    >
      <Hand size={18} className="text-accent_glow" />
      <span>TAP</span>
    </button>
  );
};

export default TapTempo;