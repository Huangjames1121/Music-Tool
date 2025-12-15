import { useState, useEffect, useRef, useCallback } from 'react';

export interface PitchData {
  note: string;
  cents: number;
  frequency: number;
  isSilent: boolean;
  octave: number;
}

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const usePitchDetector = (a4: number, isActive: boolean) => {
  const [pitchData, setPitchData] = useState<PitchData>({ 
    note: '-', 
    cents: 0, 
    frequency: 0, 
    isSilent: true,
    octave: 0
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Autocorrelation algorithm
  const autoCorrelate = (buf: Float32Array, sampleRate: number): number => {
    // 1. Compute RMS to check for silence
    let size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / size);
    
    if (rms < 0.01) return -1; // Too quiet

    // 2. Trim buffer to reliable signal range
    let r1 = 0;
    let r2 = size - 1;
    const thres = 0.2;
    for (let i = 0; i < size / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < size / 2; i++) {
      if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
    }
    
    const buf2 = buf.slice(r1, r2);
    size = buf2.length;

    // 3. Autocorrelation
    const c = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) {
        c[i] = c[i] + buf2[j] * buf2[j + i];
      }
    }

    // 4. Find the first peak
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    // 5. Parabolic interpolation for better precision
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  const getNote = useCallback((frequency: number) => {
    const noteNum = 12 * (Math.log(frequency / a4) / Math.log(2));
    const midiNum = Math.round(noteNum) + 69;
    
    const noteIndex = midiNum % 12;
    const octave = Math.floor(midiNum / 12) - 1;
    
    const note = NOTE_STRINGS[noteIndex];
    
    // Calculate cents
    // target frequency of the identified note
    const targetFreq = a4 * Math.pow(2, (midiNum - 69) / 12);
    const cents = Math.floor(1200 * Math.log2(frequency / targetFreq));

    return { note, cents, octave };
  }, [a4]);

  const updatePitch = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);

    const frequency = autoCorrelate(buffer, audioContextRef.current.sampleRate);

    if (frequency === -1) {
      setPitchData(prev => ({ ...prev, isSilent: true }));
    } else {
      const { note, cents, octave } = getNote(frequency);
      setPitchData({
        note,
        cents,
        frequency,
        isSilent: false,
        octave
      });
    }

    rafIdRef.current = requestAnimationFrame(updatePitch);
  }, [getNote]);

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
                autoGainControl: false,
                noiseSuppression: false, // Critical for musical pitch detection
            } 
        });
        streamRef.current = stream;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 2048; // High resolution
        
        source.connect(analyser);
        
        sourceRef.current = source;
        analyserRef.current = analyser;

        updatePitch();
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
      // We don't close AudioContext here to reuse it or avoid strict browser limits,
      // but we do stop processing.
      
      setPitchData(prev => ({ ...prev, isSilent: true }));
    };

    if (isActive) {
      startMic();
    } else {
      stopMic();
    }

    return () => {
      stopMic();
    };
  }, [isActive, updatePitch]);

  return pitchData;
};