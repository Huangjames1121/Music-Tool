import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useVolume } from '../hooks/useVolume';

interface DecibelMeterProps {
    isActive: boolean;
}

const DecibelMeter: React.FC<DecibelMeterProps> = ({ isActive }) => {
    const { db, isSilent } = useVolume(isActive);
    const [peak, setPeak] = useState(0);

    // Approximate conversion from dBFS (digital) to dBSPL (sound pressure)
    // Web Audio API typically gives -100dB (silence) to 0dB (clipping).
    // We apply an offset to simulate a standard SPL meter where ~30-40dB is a quiet room.
    const SPL_OFFSET = 100;
    
    // If silent (mic off/threshold), show 0, otherwise convert
    const currentSPL = isSilent ? 0 : Math.max(0, db + SPL_OFFSET);

    useEffect(() => {
        if (currentSPL > peak) {
            setPeak(currentSPL);
        }
        // Slowly decay peak
        const timer = setTimeout(() => {
            setPeak(p => Math.max(p - 0.5, 0));
        }, 50);
        return () => clearTimeout(timer);
    }, [currentSPL, peak]);

    // Normalize 0dB to 120dB range to 0-100% width
    // Standard meters usually go up to 120dB or 140dB
    const MAX_SPL = 120;
    const normalized = Math.min(100, Math.max(0, (currentSPL / MAX_SPL) * 100));
    
    // Color logic based on SPL thresholds
    let colorClass = "bg-emerald-400";
    let statusText = "Normal";
    
    if (currentSPL > 105) {
        colorClass = "bg-red-600";
        statusText = "Painful";
    } else if (currentSPL > 90) {
        colorClass = "bg-red-500";
        statusText = "Very Loud";
    } else if (currentSPL > 80) {
        colorClass = "bg-orange-400";
        statusText = "Loud";
    } else if (currentSPL > 50) {
        colorClass = "bg-emerald-400";
        statusText = "Moderate";
    } else {
        colorClass = "bg-blue-400";
        statusText = "Quiet";
    }

    return (
        <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl overflow-hidden relative">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Volume2 size={20} className="text-pink-400" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-100">Decibel Meter</h2>
                    <p className="text-xs text-slate-400">Approximate SPL (dBA)</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                
                {/* Main Digital Display */}
                <div className="relative flex flex-col items-center">
                    <div className={`text-8xl font-black font-mono tracking-tighter tabular-nums transition-colors duration-200 ${currentSPL > 90 ? 'text-red-400' : 'text-white'}`}>
                        {currentSPL.toFixed(1)}
                    </div>
                    <div className="text-2xl font-bold text-slate-500 mt-2">dB</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-600 mt-1">{statusText}</div>
                </div>

                {/* Gauge / Bar */}
                <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-xs font-mono text-slate-500 font-bold">
                        <span>30</span>
                        <span>60</span>
                        <span>85</span>
                        <span>100</span>
                        <span>120</span>
                    </div>
                    <div className="h-12 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
                        <div 
                            className={`h-full transition-all duration-100 ease-out ${colorClass}`}
                            style={{ width: `${normalized}%` }}
                        />
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex justify-between px-4">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-[2px] h-full bg-slate-900/20"></div>
                            ))}
                        </div>
                    </div>
                     <div className="flex justify-between items-center px-2">
                        <span className="text-xs text-slate-500">Peak: {peak.toFixed(1)} dB</span>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center max-w-sm">
                    <p className="text-xs text-slate-400 leading-relaxed">
                        This meter uses an offset to approximate Sound Pressure Level (SPL).
                        <br/>
                        <span className="text-slate-500">Silence is treated as 0-30 dB depending on hardware noise.</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default DecibelMeter;