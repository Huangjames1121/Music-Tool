import React from 'react';

interface BarDisplayProps {
  currentBar: number;
  currentBeat: number;
  beatsPerBar: number;
  isPlaying: boolean;
  bpm: number;
  onTap: () => void;
}

const BarDisplay: React.FC<BarDisplayProps> = ({ 
    currentBar, 
    currentBeat, 
    beatsPerBar, 
    isPlaying, 
    bpm, 
    onTap,
}) => {
  return (
    <div 
      onClick={onTap}
      className={`
        group flex flex-col items-center justify-center p-4 md:p-8 rounded-3xl shadow-2xl w-full max-w-md mx-auto transform transition-all relative overflow-hidden select-none min-h-[260px] md:min-h-[320px]
        bg-slate-800 border border-slate-700 cursor-pointer hover:border-slate-500 hover:bg-slate-800/80 active:scale-95 touch-manipulation
      `}
      title="Tap rhythmic beats here to set Tempo AND Bar Length simultaneously"
    >
        
        {/* Background Pulse Effect */}
        <div 
            className={`absolute inset-0 bg-accent opacity-0 transition-opacity duration-100 pointer-events-none ${isPlaying && currentBeat === 1 ? 'opacity-10' : ''}`} 
        />

        {/* Top Right: BPM Display */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col items-end transition-colors group-hover:text-accent">
            <div className="text-2xl md:text-4xl font-black text-slate-500 group-hover:text-accent transition-colors font-mono leading-none">{bpm}</div>
            <div className="text-[9px] md:text-[10px] text-slate-600 font-bold tracking-widest uppercase mt-1">BPM / TAP</div>
        </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <h2 className="text-xs md:text-sm font-bold tracking-wider uppercase mb-2 text-slate-400 group-hover:text-slate-300 transition-colors">
            Measure Count
        </h2>
        
        {/* Main Number Display */}
        <div className="text-7xl md:text-9xl font-black font-mono tracking-tighter tabular-nums leading-none mb-4 transition-colors text-white group-active:text-accent">
          {currentBar}
        </div>
        
        {/* Visual Beats Indicator */}
        <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-4 flex-wrap justify-center max-w-[80%] min-h-[12px]">
            {Array.from({ length: beatsPerBar }).map((_, idx) => {
                const beatNum = idx + 1;
                const isActive = beatNum === currentBeat;
                const isDownbeat = beatNum === 1;
                
                return (
                    <div 
                        key={idx}
                        className={`
                            h-2 md:h-3 rounded-full transition-all duration-75
                            ${isActive 
                                ? (isDownbeat ? 'w-6 md:w-8 bg-accent_glow shadow-[0_0_10px_#22d3ee]' : 'w-6 md:w-8 bg-white') 
                                : 'w-2 md:w-3 bg-slate-600'
                            }
                        `}
                    />
                );
            })}
        </div>
        
        {/* Bottom Text / Controls */}
        <div className="mt-6 md:mt-8 w-full h-10 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="text-slate-500 font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase animate-in fade-in key={beatsPerBar}">
                    {beatsPerBar} BEATS PER BAR
                </div>
                <div className="text-[9px] md:text-[10px] text-slate-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    (Tap {beatsPerBar + 1} times to set to {beatsPerBar + 1}/4)
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BarDisplay;