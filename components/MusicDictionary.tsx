import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Sparkles, X, ArrowRight, Lightbulb } from 'lucide-react';
import { getMusicalTermDefinition } from '../services/geminiService';
import { getSuggestions } from '../constants/dictionaryData';

// Default suggestions when input is empty
const DEFAULT_SUGGESTIONS = ["Rubato", "Crescendo", "Adagio", "Syncopation", "Arpeggio", "Staccato"];

interface MusicDictionaryProps {
    isActive: boolean;
}

const MusicDictionary: React.FC<MusicDictionaryProps> = ({ isActive }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Autocomplete State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle Input Change & Autocomplete
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        
        if (val.trim().length > 0) {
            const matches = getSuggestions(val);
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSearch = async (term: string) => {
        if (!term.trim()) return;
        
        // Hide suggestions immediately
        setShowSuggestions(false);
        setSuggestions([]);
        
        setIsLoading(true);
        setSearchTerm(term); // Ensure input matches clicked suggestion
        
        const definition = await getMusicalTermDefinition(term);
        setResult(definition);
        setIsLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setResult(null);
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Close suggestions if clicking outside (simple version: close on selection)
    
    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl overflow-hidden relative transition-all duration-500 h-[calc(100dvh-180px)] min-h-[400px] max-h-[600px]">
            {/* Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <BookOpen size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-100 text-sm md:text-base">Music Dictionary</h2>
                        <p className="text-[10px] md:text-xs text-slate-400">即時音樂術語查詢</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden relative">
                
                {/* Search Bar Container */}
                <div className="relative mb-4 md:mb-6 z-20">
                    <form onSubmit={handleSubmit} className="relative">
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={() => {
                                if(searchTerm.length > 0) setShowSuggestions(true);
                            }}
                            placeholder="輸入術語 (例如: Allegro, 漸慢)..."
                            className="w-full bg-slate-900/90 border border-slate-600 hover:border-purple-400 focus:border-purple-500 rounded-xl py-3 md:py-4 pl-10 md:pl-12 pr-12 text-base md:text-lg text-white placeholder:text-slate-500 transition-all outline-none shadow-inner"
                            autoComplete="off"
                        />
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 md:w-auto md:h-auto" size={20} />
                        {searchTerm && (
                            <button 
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-12 md:right-14 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button 
                            type="submit"
                            disabled={isLoading || !searchTerm.trim()}
                            className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
                        >
                            <ArrowRight size={20} className="w-4 h-4 md:w-5 md:h-5"/>
                        </button>
                    </form>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="py-2">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSearch(s)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-3 transition-colors group"
                                    >
                                        <Lightbulb size={14} className="text-slate-500 group-hover:text-purple-400" />
                                        <span className="text-slate-200 group-hover:text-white">{s}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Display Area */}
                <div 
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar z-10"
                    onClick={() => setShowSuggestions(false)} // Click content to close dropdown
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                <Sparkles className="text-purple-400 animate-spin-slow w-10 h-10 md:w-12 md:h-12" size={48} />
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm tracking-widest uppercase font-bold animate-pulse">Consulting the Maestro...</p>
                        </div>
                    ) : result ? (
                        <div className="bg-slate-800/80 rounded-2xl p-4 md:p-6 border border-slate-700/50 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2 capitalize flex items-center gap-2">
                                {searchTerm}
                                <span className="text-[10px] md:text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-700">Term</span>
                            </h3>
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                {result}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60">
                            <BookOpen size={64} className="text-slate-700 w-12 h-12 md:w-16 md:h-16" />
                            <div className="space-y-2">
                                <p className="text-slate-400 text-base md:text-lg">輸入術語，即時顯示定義</p>
                                <p className="text-slate-500 text-xs md:text-sm">支援中文搜尋 (如：漸強)</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                                {DEFAULT_SUGGESTIONS.map(term => (
                                    <button 
                                        key={term}
                                        onClick={() => handleSearch(term)}
                                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] md:text-xs text-slate-400 hover:text-purple-300 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MusicDictionary;