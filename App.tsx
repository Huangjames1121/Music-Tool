import React, { useState } from 'react';
import { Play, Square, RotateCcw, Minus, Plus, Settings2, ChevronDown, ChevronUp, Music, Activity, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { useMetronome } from './hooks/useMetronome';
import { useTapTempo } from './hooks/useTapTempo';
import BarDisplay from './components/BarDisplay';
import Tuner from './components/Tuner';
import MusicDictionary from './components/MusicDictionary';
import Visualizer from './components/Visualizer';
import AppLogo from './components/AppLogo';
import InstallPrompt from './components/InstallPrompt';
import { TimeSignature } from './types';
import { SIGNATURE_CONFIGS, DEFAULT_BPM, MIN_BPM, MAX_BPM, getTempoMarking } from './constants';

type Tab = 'practice' | 'tuner' | 'dictionary';

const App: React.FC = () => {
  // Config State
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [timeSigKey, setTimeSigKey] = useState<TimeSignature>(TimeSignature.FourFour);
  const [customBeats, setCustomBeats] = useState<number | null>(null);
  const [customVal, setCustomVal] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [isMuted, setIsMuted] = useState(false);
  
  // New state for display logic
  const [tapCount, setTapCount] = useState(0);

  // Derived config
  const beatsPerBar = customBeats ?? SIGNATURE_CONFIGS[timeSigKey].beats;
  const noteValue = customVal ?? SIGNATURE_CONFIGS[timeSigKey].value;

  const { isPlaying, currentBar, currentBeat, start, stop, reset } = useMetronome({
    bpm,
    beatsPerBar,
    noteValue,
    isMuted
  });

  const handleBpmChange = (newBpm: number) => {
    setBpm(Math.min(Math.max(newBpm, MIN_BPM), MAX_BPM));
  };

  // Unified Tap Handler
  const handleTapUpdate = ({ bpm, count }: { bpm: number | null, count: number }) => {
      // Set the visual tap count
      setTapCount(count);

      // 1. Update Beat Count (Bar Length)
      // If user taps 3 times, set to 3 beats per bar.
      if (count >= 1) {
          setCustomBeats(count);
          // Default to quarter notes if we are setting custom structure
          if (!customVal) setCustomVal(4);
      }

      // 2. Update BPM if calculated
      if (bpm) {
          handleBpmChange(bpm);
      }
  };
  
  // Initialize Tap Tempo Hook
  const { handleTap } = useTapTempo(handleTapUpdate);

  const handleStart = () => {
      setTapCount(0); // Clear tap count to show measure count
      start();
  };

  const handleReset = () => {
      setTapCount(0); // Clear tap count to show measure count
      reset();
  };

  const handleStop = () => {
      stop();
      // We don't necessarily clear tap count here, but usually stop implies pausing measure count.
      // Keeping tapCount as is (likely 0 from start) ensures we see Measure Count when paused.
  };

  const handleTimeSigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TimeSignature;
    setTimeSigKey(val);
    // Reset custom overrides
    setCustomBeats(null);
    setCustomVal(null);
    setTapCount(0);
  };

  // Logic to determine if we are in "Tapping Mode" (visuals) or "Metronome Mode"
  const isTappingMode = !isPlaying && tapCount > 0;

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-slate-100 font-sans selection:bg-accent selection:text-slate-900 flex flex-col relative overflow-x-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900 blur-[120px] opacity-20"></div>
         <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-900 blur-[120px] opacity-20"></div>
      </div>

      <Visualizer />
      
      {/* PWA Install Button (Absolute Positioned) */}
      <div className="absolute top-4 right-4 z-50">
        <InstallPrompt />
      </div>

      <header className="px-4 py-4 md:p-6 md:pb-2 text-center z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-1 animate-in slide-in-from-top-4 duration-500">
            <AppLogo size={40} className="drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] md:w-12 md:h-12" />
            <div className="flex flex-col items-start">
                <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-slate-400 bg-clip-text text-transparent">
                Smart Bar Counter
                </h1>
            </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex p-1 bg-slate-800/80 backdrop-blur rounded-full border border-slate-700 mt-4 md:mt-6 gap-1 shadow-lg overflow-x-auto max-w-full no-scrollbar touch-pan-x">
            <button
                onClick={() => setActiveTab('practice')}
                className={`
                    flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap
                    ${activeTab === 'practice' 
                        ? 'bg-accent text-slate-900 shadow-lg shadow-cyan-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                `}
            >
                <Music size={14} className="md:w-4 md:h-4" />
                <span>Practice</span>
            </button>
            <button
                onClick={() => setActiveTab('tuner')}
                className={`
                    flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap
                    ${activeTab === 'tuner' 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                `}
            >
                <Activity size={14} className="md:w-4 md:h-4" />
                <span>Tuner</span>
            </button>
            <button
                onClick={() => setActiveTab('dictionary')}
                className={`
                    flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap
                    ${activeTab === 'dictionary' 
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                `}
            >
                <BookOpen size={14} className="md:w-4 md:h-4" />
                <span>Terms</span>
            </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-2 md:p-4 z-10 w-full max-w-2xl mx-auto">
        
        {/* Tab 1: Practice Content */}
        <div className={`w-full flex flex-col items-center gap-4 md:gap-8 animate-in fade-in zoom-in-95 duration-300 ${activeTab === 'practice' ? 'block' : 'hidden'}`}>
            
            {/* Main Display with Unified Tap Tempo & Count */}
            <BarDisplay 
                currentBar={currentBar} 
                currentBeat={currentBeat} 
                beatsPerBar={beatsPerBar}
                isPlaying={isPlaying}
                bpm={bpm}
                onTap={handleTap}
                isTapping={isTappingMode}
                tapCount={tapCount}
            />

            {/* Playback Controls */}
            <div className="flex items-center gap-3 md:gap-4">
                <button 
                    onClick={handleReset}
                    className="p-3 md:p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 active:scale-95 active:bg-slate-600"
                    title="Reset Counter"
                >
                    <RotateCcw size={18} className="md:w-5 md:h-5" />
                </button>

                <button 
                    onClick={isPlaying ? handleStop : handleStart}
                    className={`
                        p-5 md:p-6 rounded-full transition-all shadow-xl hover:scale-105 active:scale-95
                        flex items-center justify-center
                        ${isPlaying 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                            : 'bg-accent hover:bg-accent_glow text-slate-900 shadow-cyan-500/20'
                        }
                    `}
                >
                    {isPlaying ? <Square fill="currentColor" size={28} className="md:w-8 md:h-8" /> : <Play fill="currentColor" className="ml-1 md:w-8 md:h-8" size={28} />}
                </button>

                 <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`
                        p-3 md:p-4 rounded-full transition-all border
                        ${isMuted 
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                        }
                    `}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <VolumeX size={18} className="md:w-5 md:h-5" /> : <Volume2 size={18} className="md:w-5 md:h-5" />}
                </button>
            </div>

            {/* Manual Settings Toggle */}
            <div className="w-full flex flex-col items-center gap-4">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs md:text-sm font-medium py-2 px-4 rounded-full hover:bg-slate-800/50"
                >
                    <Settings2 size={14} className="md:w-4 md:h-4" />
                    <span>Manual Settings</span>
                    {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Collapsible Settings Panel */}
                {showSettings && (
                    <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-slate-700/50 animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex flex-col gap-6">
                            
                            {/* BPM Control */}
                            <div className="flex-1 w-full space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo</label>
                                    <span className="text-xs font-bold text-accent font-mono">
                                        {getTempoMarking(bpm)} <span className="text-slate-500 mx-1">|</span> {bpm} BPM
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min={MIN_BPM} 
                                    max={MAX_BPM} 
                                    value={bpm} 
                                    onChange={(e) => handleBpmChange(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent touch-none"
                                />
                                <div className="flex justify-between pt-2">
                                    <div className="flex gap-2 w-full justify-between md:justify-start">
                                        <button onClick={() => handleBpmChange(bpm - 1)} className="p-2 md:p-1 bg-slate-800 md:bg-transparent hover:bg-slate-700 rounded text-slate-300 md:text-slate-400 hover:text-white flex-1 md:flex-none flex justify-center"><Minus size={16}/></button>
                                        <button onClick={() => handleBpmChange(bpm + 1)} className="p-2 md:p-1 bg-slate-800 md:bg-transparent hover:bg-slate-700 rounded text-slate-300 md:text-slate-400 hover:text-white flex-1 md:flex-none flex justify-center"><Plus size={16}/></button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-slate-700/50 w-full"></div>

                            {/* Time Sig Control */}
                            <div className="w-full space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Time Signature</label>
                                
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select 
                                            value={customBeats ? 'custom' : timeSigKey} 
                                            onChange={(e) => {
                                                if (e.target.value !== 'custom') handleTimeSigChange(e);
                                            }}
                                            className="w-full appearance-none bg-slate-700 hover:bg-slate-600 text-white pl-4 pr-10 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-accent transition-colors font-mono cursor-pointer"
                                        >
                                            {Object.values(TimeSignature).map((sig) => (
                                                <option key={sig} value={sig}>{sig}</option>
                                            ))}
                                            {customBeats && <option value="custom">Custom ({beatsPerBar} Beats)</option>}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Tab 2: Tuner Content */}
        <div className={`w-full h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 ${activeTab === 'tuner' ? 'block' : 'hidden'}`}>
             <Tuner isActive={activeTab === 'tuner'} />
        </div>

        {/* Tab 3: Dictionary Content */}
        <div className={`w-full h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 ${activeTab === 'dictionary' ? 'block' : 'hidden'}`}>
             <MusicDictionary isActive={activeTab === 'dictionary'} />
        </div>

      </main>
      
      <footer className="p-4 text-center text-slate-600 text-[10px] md:text-xs z-10 pb-6 md:pb-4">
        Uses Web Audio API for precision timing & signal analysis
      </footer>
    </div>
  );
};

export default App;