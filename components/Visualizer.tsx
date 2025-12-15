import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';

const Visualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string>('');

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 64; // Small FFT for performance/simplicity
            
            setIsListening(true);
            draw();
        } catch (err) {
            setError('Mic access denied');
            console.error(err);
        }
    };

    const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const render = () => {
            if (!analyserRef.current) return;
            requestRef.current = requestAnimationFrame(render);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                // Gradient color
                const r = barHeight + 25 * (i/bufferLength);
                const g = 250 * (i/bufferLength);
                const b = 255; // Blue tint

                ctx.fillStyle = `rgb(34, 211, 238)`; // Accent glow color
                ctx.globalAlpha = 0.5;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        render();
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    if (!isListening) {
        return (
             <div className="absolute top-4 left-4 z-50">
                {error ? (
                    <span className="text-red-400 text-xs font-mono">{error}</span>
                ) : (
                    <button 
                        onClick={startListening}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-accent transition-colors p-2 bg-slate-900/50 rounded-full border border-slate-800/50 backdrop-blur-sm"
                    >
                        <Mic size={14} /> 
                        <span className="hidden xs:inline">Vis</span>
                    </button>
                )}
             </div>
        );
    }

    return (
        <canvas 
            ref={canvasRef} 
            width={200} 
            height={50} 
            className="absolute top-4 left-4 z-0 opacity-50 pointer-events-none" 
        />
    );
};

export default Visualizer;