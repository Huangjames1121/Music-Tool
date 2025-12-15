import React, { useState, useEffect, useRef } from 'react';
import { Volume2, SlidersHorizontal, Check, Mic, ChevronRight, RotateCcw, Settings2, Target } from 'lucide-react';
import { useVolume } from '../hooks/useVolume';

interface DynamicsMeterProps {
    isActive: boolean;
}

type CalibrationStep = 'idle' | 'min_intro' | 'min_recording' | 'max_intro' | 'max_recording' | 'finished';

// Default reasonable thresholds (dB)
const DEFAULT_THRESHOLDS = {
    ppp: -60,
    pp: -50,
    p: -40,
    mp: -32,
    mf: -24,
    f: -16,
    ff: -10,
    fff: -5
};

type DynamicKey = keyof typeof DEFAULT_THRESHOLDS;
const DYNAMIC_ORDER: DynamicKey[] = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];

const DYNAMIC_LABELS: Record<DynamicKey, { label: string, color: string }> = {
    ppp: { label: 'Piano Pianissimo', color: 'text-blue-200' },
    pp: { label: 'Pianissimo', color: 'text-blue-300' },
    p: { label: 'Piano', color: 'text-blue-400' },
    mp: { label: 'Mezzo Piano', color: 'text-emerald-300' },
    mf: { label: 'Mezzo Forte', color: 'text-emerald-400' },
    f: { label: 'Forte', color: 'text-orange-400' },
    ff: { label: 'Fortissimo', color: 'text-orange-500' },
    fff: { label: 'Fortississimo', color: 'text-red-500' }
};

const DynamicsMeter: React.FC<DynamicsMeterProps> = ({ isActive }) => {
    const { db, isSilent } = useVolume(isActive);
    
    // Config: Specific thresholds for each level
    // These values represent the "Center" or "Start" of that dynamic range
    const [thresholds, setThresholds] = useState<Record<DynamicKey, number>>(DEFAULT_THRESHOLDS);
    
    // UI State
    const [isEditing, setIsEditing] = useState(false);

    // Internal Smoothed DB for visual stability
    const [smoothedDb, setSmoothedDb] = useState(-100);

    // Calibration State (Legacy Auto-Calibration)
    const [step, setStep] = useState<CalibrationStep>('idle');
    const [tempMin, setTempMin] = useState<number[]>([]);
    const [tempMax, setTempMax] = useState<number[]>([]);
    const recordingTimerRef = useRef<number | null>(null);

    // Smoothing Loop
    useEffect(() => {
        if (!isActive) return;
        
        let animationFrame: number;

        const updateSmooth = () => {
            setSmoothedDb(prev => {
                const target = isSilent ? -100 : db;
                const diff = target - prev;
                // Faster reaction for attack, slower for decay to make it readable
                const factor = diff > 0 ? 0.2 : 0.05; 
                if (Math.abs(diff) < 0.1) return target;
                return prev + diff * factor;
            });
            animationFrame = requestAnimationFrame(updateSmooth);
        };

        updateSmooth();

        return () => cancelAnimationFrame(animationFrame);
    }, [db, isSilent, isActive]);


    // Recording Logic for Auto-Calibration
    useEffect(() => {
        if (step === 'min_recording' && !isSilent) setTempMin(prev => [...prev, db]);
        if (step === 'max_recording' && !isSilent) setTempMax(prev => [...prev, db]);
    }, [db, isSilent, step]);

    // --- Auto Calibration Logic ---
    const startCalibration = () => {
        setIsEditing(false);
        setStep('min_intro');
        setTempMin([]);
        setTempMax([]);
    };

    const startRecordingMin = () => {
        setStep('min_recording');
        setTempMin([]);
        recordingTimerRef.current = window.setTimeout(() => {
            setStep('max_intro');
        }, 3000);
    };

    const startRecordingMax = () => {
        setStep('max_recording');
        setTempMax([]);
        recordingTimerRef.current = window.setTimeout(() => {
            finishAutoCalibration();
        }, 3000);
    };

    const finishAutoCalibration = () => {
        // Helper to get robust min/max ignoring outliers
        const getRobustMetric = (arr: number[], type: 'min' | 'max') => {
            if (arr.length < 5) return type === 'min' ? -60 : -5;
            const sorted = [...arr].sort((a, b) => a - b);
            if (type === 'max') {
                const topSlice = sorted.slice(Math.floor(sorted.length * 0.7));
                return topSlice.reduce((a, b) => a + b, 0) / topSlice.length;
            } else {
                const bottomSlice = sorted.slice(0, Math.ceil(sorted.length * 0.3));
                return bottomSlice.reduce((a, b) => a + b, 0) / bottomSlice.length;
            }
        };

        let calcMin = getRobustMetric(tempMin, 'min');
        let calcMax = getRobustMetric(tempMax, 'max');

        if (calcMax <= calcMin + 10) calcMax = calcMin + 20;

        // Distribute linearly between measured Min (ppp) and Max (fff)
        const range = calcMax - calcMin;
        const stepSize = range / 7; // 7 intervals between 8 points

        const newThresholds = { ...thresholds };
        DYNAMIC_ORDER.forEach((key, index) => {
            newThresholds[key] = calcMin + (stepSize * index);
        });

        setThresholds(newThresholds);
        setStep('finished');
        setTimeout(() => setStep('idle'), 1500);
    };

    const resetCalibration = () => {
        setThresholds(DEFAULT_THRESHOLDS);
        if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        setStep('idle');
    };

    // --- Dynamic Detection Logic ---
    const getDynamicMarking = (currentDb: number) => {
        // We find the closest threshold value
        let closestKey: DynamicKey = 'ppp';
        let minDiff = Infinity;

        // Strategy: Find which dynamic range we are closest to
        // Alternatively, we can see which threshold we have surpassed.
        // Let's stick to a "zone" logic. The threshold is the center of the zone.
        
        for (const key of DYNAMIC_ORDER) {
            const diff = Math.abs(currentDb - thresholds[key]);
            if (diff < minDiff) {
                minDiff = diff;
                closestKey = key;
            }
        }

        // If very silent, force nothing/ppp
        if (currentDb < thresholds.ppp - 10) return { text: '---', label: 'Silent', color: 'text-slate-600' };

        return { 
            text: closestKey, 
            ...DYNAMIC_LABELS[closestKey] 
        };
    };

    // --- Manual Threshold Update ---
    const handleThresholdChange = (key: DynamicKey, val: number) => {
        setThresholds(prev => ({ ...prev, [key]: val }));
    };

    const captureCurrentAs = (key: DynamicKey) => {
        if (!isSilent) {
            handleThresholdChange(key, Math.round(smoothedDb));
        }
    };

    const displayDynamic = (isSilent && step === 'idle' && !isEditing) 
        ? { text: '---', label: 'Silent', color: 'text-slate-600' } 
        : getDynamicMarking(smoothedDb);

    // Calculate generic percentage for the bar (0 to 100 based on ppp to fff range)
    const minT = thresholds.ppp;
    const maxT = thresholds.fff;
    const barPercentage = Math.min(100, Math.max(0, ((smoothedDb - minT) / (maxT - minT)) * 100));


    // --- RENDER ---
    const renderContent = () => {
        if (step !== 'idle' && step !== 'finished') {
            // ... (Calibration Wizard UI - mostly unchanged)
            switch (step) {
                case 'min_intro':
                    return (
                        <div className="text-center space-y-6 animate-in fade-in">
                            <div className="p-6 bg-blue-500/10 rounded-full mx-auto w-fit"><Mic size={48} className="text-blue-400" /></div>
                            <h3 className="text-2xl font-bold text-white">Softest Long Tone</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">Play a long note at <strong className="text-blue-300">ppp</strong>.</p>
                            <button onClick={startRecordingMin} className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto">Start <ChevronRight size={18} /></button>
                        </div>
                    );
                case 'min_recording':
                    return (
                         <div className="text-center space-y-6 animate-pulse">
                            <div className="text-4xl font-bold text-blue-300">Listening...</div>
                            <div className="h-2 w-48 bg-slate-700 rounded-full mx-auto overflow-hidden">
                                <div className="h-full bg-blue-500 animate-[widthFull_3s_ease-in-out_forwards]"></div>
                            </div>
                         </div>
                    );
                case 'max_intro':
                    return (
                        <div className="text-center space-y-6 animate-in fade-in">
                            <div className="p-6 bg-red-500/10 rounded-full mx-auto w-fit"><Mic size={48} className="text-red-400" /></div>
                            <h3 className="text-2xl font-bold text-white">Loudest Long Tone</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">Play a long note at <strong className="text-red-400">fff</strong>.</p>
                            <button onClick={startRecordingMax} className="bg-red-500 hover:bg-red-400 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto">Start <ChevronRight size={18} /></button>
                        </div>
                    );
                case 'max_recording':
                    return (
                         <div className="text-center space-y-6 animate-pulse">
                            <div className="text-4xl font-bold text-red-400">Listening...</div>
                            <div className="h-2 w-48 bg-slate-700 rounded-full mx-auto overflow-hidden">
                                <div className="h-full bg-red-500 animate-[widthFull_3s_ease-in-out_forwards]"></div>
                            </div>
                         </div>
                    );
            }
        }

        if (isEditing) {
            return (
                <div className="w-full max-h-[380px] overflow-y-auto pr-2 space-y-3 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-900/90 p-2 z-10 backdrop-blur">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fine Tune Thresholds</h3>
                        <div className="text-xs text-slate-500 font-mono">Curr: {smoothedDb.toFixed(1)} dB</div>
                    </div>
                    {DYNAMIC_ORDER.map((key) => (
                        <div key={key} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                            <div className={`w-8 text-center font-bold font-serif ${DYNAMIC_LABELS[key].color}`}>{key}</div>
                            <input 
                                type="range" 
                                min="-90" 
                                max="0" 
                                step="1"
                                value={thresholds[key]}
                                onChange={(e) => handleThresholdChange(key, parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                            <div className="text-xs font-mono w-10 text-right text-slate-400">{thresholds[key]}</div>
                            <button 
                                onClick={() => captureCurrentAs(key)}
                                className="p-2 bg-slate-700 hover:bg-accent hover:text-slate-900 rounded-lg transition-colors text-slate-400"
                                title="Set to current volume"
                            >
                                <Target size={14} />
                            </button>
                        </div>
                    ))}
                    <div className="h-4"></div>
                </div>
            );
        }

        return (
            <>
                <div className="flex flex-col items-center gap-2 animate-in fade-in duration-500">
                    <div className={`text-[10rem] font-black font-serif italic tracking-tighter ${displayDynamic.color} drop-shadow-2xl transition-all duration-100 leading-none select-none`}>
                        {displayDynamic.text}
                    </div>
                    <div className={`text-2xl font-medium tracking-widest uppercase ${displayDynamic.color} opacity-80 mt-4`}>
                        {displayDynamic.label}
                    </div>
                </div>

                <div className="w-full max-w-xs mt-12">
                    <div className="flex justify-between text-xs font-mono text-slate-500 mb-2 font-bold tracking-widest">
                        <span>ppp ({thresholds.ppp})</span>
                        <span>fff ({thresholds.fff})</span>
                    </div>
                    <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600 shadow-inner relative">
                        <div 
                            className="absolute top-0 left-0 h-full transition-all duration-75 ease-out"
                            style={{ 
                                width: `${barPercentage}%`,
                                background: `linear-gradient(90deg, #60a5fa 0%, #34d399 50%, #f97316 100%)`
                            }}
                        />
                         {/* Optional markers for thresholds? It might look messy. keeping it clean. */}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl overflow-hidden relative transition-all duration-500">
            {/* Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Volume2 size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-100">Dynamics</h2>
                        <p className="text-xs text-slate-400">Expression Meter</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {(step === 'idle' || step === 'finished') && (
                        <>
                             <button 
                                onClick={() => setIsEditing(!isEditing)} 
                                className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-accent text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                title="Fine Tune Levels"
                            >
                                <Settings2 size={18} />
                             </button>
                             <button 
                                onClick={resetCalibration} 
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="Reset to Defaults"
                             >
                                <RotateCcw size={18} />
                             </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                {renderContent()}
            </div>
            
            {/* Footer Actions */}
            {!isEditing && step === 'idle' && (
                 <footer className="p-4 bg-slate-800/80 border-t border-slate-700/50 flex items-center justify-center gap-4">
                    <button 
                        onClick={startCalibration}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all border border-slate-600 active:scale-95 shadow-lg"
                    >
                        <SlidersHorizontal size={16} />
                        Auto Calibrate (Min/Max)
                    </button>
                 </footer>
            )}
             {isEditing && (
                 <footer className="p-4 bg-slate-800/80 border-t border-slate-700/50 flex items-center justify-center gap-4">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 bg-accent hover:bg-accent_glow text-slate-900 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        <Check size={16} />
                        Done Editing
                    </button>
                 </footer>
            )}

            <style>{`
                @keyframes widthFull {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default DynamicsMeter;