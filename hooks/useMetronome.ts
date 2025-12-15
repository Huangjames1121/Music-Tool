import { useState, useEffect, useRef, useCallback } from 'react';

// Scheduler config
const LOOKAHEAD_MS = 25.0; // How frequently to call scheduling function (in milliseconds)
const SCHEDULE_AHEAD_TIME_SEC = 0.1; // How far ahead to schedule audio (in seconds)

interface UseMetronomeProps {
  bpm: number;
  beatsPerBar: number;
  noteValue: number; // 4 or 8
  isMuted: boolean; // New prop for muting audio
  onBeat?: (bar: number, beat: number) => void;
}

export const useMetronome = ({ bpm, beatsPerBar, noteValue, isMuted, onBeat }: UseMetronomeProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBar, setCurrentBar] = useState(1);
  const [currentBeat, setCurrentBeat] = useState(1);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0.0);
  const timerIDRef = useRef<number | null>(null);
  
  // Counters Refs (to avoid stale closures in interval)
  const beatCountRef = useRef(1); // 1-indexed beat in bar
  const barCountRef = useRef(1);  // 1-indexed bar count

  // Helper to unlock audio context on iOS/browsers
  const unlockAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const playClick = (time: number, isFirstBeat: boolean) => {
    // If muted, we skip the audio generation but keep the function call 
    // to preserve the logic flow if needed, though mostly we just return early.
    // However, we MUST NOT return early for the scheduling logic of the visual UI,
    // but this function is purely for audio.
    if (isMuted || !audioContextRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (isFirstBeat) {
      osc.frequency.value = 1200; // High pitch for downbeat
    } else {
      osc.frequency.value = 800;  // Lower pitch for other beats
    }

    gainNode.gain.value = 1;
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.start(time);
    osc.stop(time + 0.1);
  };

  const scheduleNote = useCallback((barNumber: number, beatNumber: number, time: number) => {
     // Push to UI queue or sync state
     // We accept barNumber and beatNumber as arguments to ensure the UI updates
     // match exactly the note being scheduled, regardless of the scheduler's lookahead.
     
     const isFirstBeat = beatNumber === 1;
     playClick(time, isFirstBeat);

     // Sync UI
     const drawVisuals = () => {
        setCurrentBeat(beatNumber);
        setCurrentBar(barNumber);
        if (onBeat) onBeat(barNumber, beatNumber);
     };

     // Calculate delay until this note actually plays
     if (!audioContextRef.current) return;
     const contextTime = audioContextRef.current.currentTime;
     const delay = (time - contextTime) * 1000;
     
     // Best effort UI sync
     setTimeout(drawVisuals, Math.max(0, delay));

  }, [onBeat, isMuted]); // Added isMuted to dependency

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;

    // while there are notes that will play between now and now + scheduleAheadTime
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + SCHEDULE_AHEAD_TIME_SEC) {
      
      scheduleNote(barCountRef.current, beatCountRef.current, nextNoteTimeRef.current);

      // Advance time
      // 60.0 / bpm = seconds per quarter note
      const secondsPerBeat = 60.0 / bpm; 
      nextNoteTimeRef.current += secondsPerBeat;

      // Advance counters
      beatCountRef.current++;
      if (beatCountRef.current > beatsPerBar) {
        beatCountRef.current = 1;
        barCountRef.current++;
      }
    }
    
    timerIDRef.current = window.setTimeout(scheduler, LOOKAHEAD_MS);
  }, [bpm, beatsPerBar, scheduleNote]);

  const start = useCallback(async () => {
    await unlockAudioContext();
    if (!audioContextRef.current) return;

    if (isPlaying) return;

    // Reset counters if resuming from stop, or keep logic if pause (currently stop resets logic partially)
    // We assume Start always continues or starts fresh depending on implementation, 
    // but here we use current refs.
    // However, to ensure sync, we recalculate start time.
    
    nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.1;
    setIsPlaying(true);
    scheduler();
  }, [isPlaying, unlockAudioContext, scheduler]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timerIDRef.current) {
      window.clearTimeout(timerIDRef.current);
    }
  }, []);

  const reset = useCallback(() => {
     stop();
     setCurrentBar(1);
     setCurrentBeat(1);
     barCountRef.current = 1;
     beatCountRef.current = 1;
  }, [stop]);

  // Handle cleanup
  useEffect(() => {
    return () => {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
    };
  }, []);

  // Update scheduler if settings change while playing
  useEffect(() => {
      if (isPlaying) {
          if (timerIDRef.current) clearTimeout(timerIDRef.current);
          scheduler();
      }
  }, [scheduler, isPlaying]);


  return {
    isPlaying,
    currentBar,
    currentBeat,
    start,
    stop,
    reset
  };
};