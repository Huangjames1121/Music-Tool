import React, { useState } from 'react';
import { Mic, Minus, Plus, Settings } from 'lucide-react';
import { usePitchDetector } from '../hooks/usePitchDetector';

interface TunerProps {
    isActive: boolean;
}

const Tuner: React.FC<TunerProps> = ({ isActive }) => {
  const [referenceA4, setReferenceA4] = useState(442);
  const { note, cents, frequency, isSilent, octave } = usePitchDetector(referenceA4, isActive);

  // Clamp cents to -50 to 50 for display bounds
  const clampedCents = Math.max(-50, Math.min(50, cents));
  
  // Calculate needle rotation: -50cents = -90deg, 0cents = 0deg, +50cents = +90deg
  const rotation = (clampedCents / 50) * 90; 

  // Tuning Status
  const isInTune = !isSilent && Math.abs(cents) <= 3; // Strict 3 cent tolerance for visual "Perfect"
  const isSharp = !isSilent && cents > 3;
  const isFlat = !isSilent && cents < -3;

  // Dynamic Styles
  let mainColorClass = "text-slate-500";
  let gaugeColorClass = "stroke-slate-700";
  let needleColorClass = "bg-slate-600";
  let glowClass = "";
  let statusText = "Listening...";
  
  if (!isSilent) {
    if (isInTune) {
        mainColorClass = "text-emerald-400";
        gaugeColorClass = "stroke-emerald-500/30";
        needleColorClass = "bg-emerald-400 shadow-[0_0_15px_#34d399]";
        glowClass = "shadow-[0_0_100px_rgba(52,211,153,0.15)]";
        statusText = "PERFECT";
    } else if (isFlat) {
        mainColorClass = "text-amber-400";
        gaugeColorClass = "stroke-amber-500/30";
        needleColorClass = "bg-amber-400";
        statusText = "TOO LOW";
    } else {
        mainColorClass = "text-rose-400";
        gaugeColorClass = "stroke-rose-500/30";
        needleColorClass = "bg-rose-400";
        statusText = "TOO HIGH";
    }
  }

  const handleDecreaseA4 = () => setReferenceA4(prev => Math.max(430, prev - 1));
  const handleIncreaseA4 = () => setReferenceA4(prev => Math.min(450, prev + 1));

  return (
    <div className={`flex flex-col w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl overflow-hidden relative transition-all duration-700 h-[calc(100dvh-200px)] min-h-[400px] max-h-[600px] ${glowClass}`}>
      
      {/* Header */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors duration-500 ${isInTune ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                <Mic size={20} className={isInTune ? 'text-emerald-400' : 'text-slate-400'} />
            </div>
            <div>
                <h2 className="font-bold text-slate-100 text-sm md:text-base">Pro Tuner</h2>
                <p className="text-[10px] md:text-xs text-slate-400">Chromatic</p>
            </div>
        </div>
        
        {/* A4 Adjustment */}
        <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 pr-3 border border-slate-700">
            <div className="flex flex-col px-2 border-r border-slate-700 mr-1">
                 <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">Ref</span>
                 <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">Freq</span>
            </div>
            <button onClick={handleDecreaseA4} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Minus size={12} /></button>
            <span className="text-xs md:text-sm font-mono font-bold text-accent w-[3ch] text-center select-none">{referenceA4}</span>
            <button onClick={handleIncreaseA4} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Plus size={12} /></button>
            <span className="text-[10px] md:text-xs text-slate-500 font-bold ml-1">Hz</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-8 relative overflow-hidden">
         
         {/* Background Grid Decoration */}
         <div className="absolute inset-0 opacity-5 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Note Display */}
         <div className="flex-1 flex flex-col items-center justify-center relative z-10 mt-2 md:mt-4">
            {isSilent ? (
                <div className="flex flex-col items-center animate-pulse opacity-50">
                    <span className="text-7xl md:text-8xl font-black text-slate-700 tracking-tighter select-none">--</span>
                    <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-slate-600 mt-4 font-bold">Play a Note</span>
                </div>
            ) : (
                <div className="flex flex-col items-center relative">
                     <div className="relative">
                        <span className={`text-[6rem] md:text-[9rem] leading-none font-black tracking-tighter transition-colors duration-200 drop-shadow-2xl ${mainColorClass}`}>
                            {note}
                        </span>
                        <span className={`absolute top-0 -right-4 md:top-4 md:-right-8 text-2xl md:text-4xl font-bold opacity-60 ${mainColorClass}`}>
                            {octave}
                        </span>
                     </div>
                     <div className="mt-2 md:mt-4 flex flex-col items-center gap-1">
                        <span className={`text-xs md:text-sm font-black tracking-[0.3em] uppercase ${mainColorClass} transition-all duration-300`}>
                            {statusText}
                        </span>
                        <span className="font-mono text-slate-500 text-xs md:text-sm bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700/50">
                            {frequency.toFixed(1)} Hz
                        </span>
                     </div>
                </div>
            )}
         </div>

         {/* Gauge Container */}
         <div className="relative w-full max-w-[280px] md:max-w-[400px] h-[100px] md:h-[140px] flex justify-center items-end mt-4 mb-2">
            
            {/* SVG Arc Gauge */}
            <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible pointer-events-none">
                {/* Defs for gradients */}
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" /> {/* Amber */}
                        <stop offset="45%" stopColor="#34d399" /> {/* Emerald */}
                        <stop offset="55%" stopColor="#34d399" /> {/* Emerald */}
                        <stop offset="100%" stopColor="#fb7185" /> {/* Rose */}
                    </linearGradient>
                </defs>

                {/* Track Background */}
                <path d="M 30 140 A 120 120 0 0 1 270 140" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />

                {/* Ticks */}
                {/* Center 0 */}
                <line x1="150" y1="15" x2="150" y2="35" stroke={isInTune ? "#34d399" : "#475569"} strokeWidth="3" />
                {/* -50 */}
                <line x1="30" y1="140" x2="50" y2="135" stroke="#475569" strokeWidth="2" transform="rotate(10 30 140)" /> 
                {/* +50 */}
                <line x1="270" y1="140" x2="250" y2="135" stroke="#475569" strokeWidth="2" transform="rotate(-10 270 140)" />
                
                {/* Labels */}
                <text x="30" y="165" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">-50</text>
                <text x="150" y="165" textAnchor="middle" fill={isInTune ? "#34d399" : "#64748b"} fontSize="10" fontWeight="bold">0</text>
                <text x="270" y="165" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">+50</text>
                
                {/* Dynamic Cent Value Text */}
                {!isSilent && (
                     <text x="150" y="100" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        {cents > 0 ? '+' : ''}{cents} ¢
                     </text>
                )}
            </svg>

            {/* Needle */}
            <div 
                className="absolute bottom-[0px] left-1/2 w-0 h-0 z-20"
                style={{ 
                    transform: `translateX(-50%) rotate(${isSilent ? 0 : rotation}deg)`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)' 
                }}
            >
                {/* Needle Shape */}
                <div className="relative -top-[100px] md:-top-[130px] -left-[1.5px] md:-left-[2px] w-[3px] md:w-[4px] h-[100px] md:h-[130px]">
                     <div className={`w-full h-full rounded-full ${needleColorClass} transition-colors duration-200`}></div>
                </div>
            </div>
            
            {/* Needle Pivot Cap */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 bg-slate-800 rounded-full border-4 border-slate-700 z-30 shadow-lg"></div>

         </div>
      </div>
    </div>
  );
};

export default Tuner;