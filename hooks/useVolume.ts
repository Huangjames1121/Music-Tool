import { useState, useEffect, useRef } from 'react';

export interface VolumeData {
  rms: number; // 0.0 to 1.0
  db: number;  // Typically -100 to 0
  isSilent: boolean;
}

export const useVolume = (isActive: boolean) => {
  const [volumeData, setVolumeData] = useState<VolumeData>({
    rms: 0,
    db: -100,
    isSilent: true,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const updateVolume = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square)
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / bufferLength);

    // Calculate Decibels
    // Standard reference is 1.0. 
    // Usually dB = 20 * log10(rms).
    // If rms is 0 (silence), log10 is -Infinity.
    const db = rms > 0 ? 20 * Math.log10(rms) : -100;

    // Smoothing filter to prevent jitter
    setVolumeData(prev => {
        const SMOOTHING = 0.2;
        const smoothDb = prev.db === -100 ? db : prev.db * (1 - SMOOTHING) + db * SMOOTHING;
        
        return {
            rms,
            db: smoothDb,
            isSilent: db < -60 // Threshold for silence
        };
    });

    rafIdRef.current = requestAnimationFrame(updateVolume);
  };

  useEffect(() => {
    const startMic = async () => {
      if (!isActive) return;

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                autoGainControl: false, // Important for measuring volume dynamics
                noiseSuppression: false, 
            } 
        });
        streamRef.current = stream;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 512; 
        analyser.smoothingTimeConstant = 0.3;
        
        source.connect(analyser);
        
        sourceRef.current = source;
        analyserRef.current = analyser;

        updateVolume();
      } catch (err) {
        console.error("Microphone access failed", err);
      }
    };

    const stopMic = () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      setVolumeData({ rms: 0, db: -100, isSilent: true });
    };

    if (isActive) {
      startMic();
    } else {
      stopMic();
    }

    return () => {
      stopMic();
    };
  }, [isActive]);

  return volumeData;
};