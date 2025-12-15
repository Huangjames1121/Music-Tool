import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { parsePromptToSettings } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  onSettingsUpdate: (settings: { bpm: number; beatsPerBar: number; noteValue: number }) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onSettingsUpdate }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! Tell me what you are practicing (e.g., "Fast jazz waltz" or "Slow 4/4 blues"), and I will set the counter for you.' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Optimistic UI
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(newHistory);

    const result = await parsePromptToSettings(userText, newHistory);
    
    setMessages(prev => [...prev, { role: 'model', text: result.responseText }]);

    if (result.settings) {
       onSettingsUpdate({
         bpm: result.settings.bpm,
         beatsPerBar: result.settings.beatsPerBar,
         noteValue: result.settings.noteValue
       });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-accent to-blue-600 rounded-lg">
             <Bot size={20} className="text-white" />
        </div>
        <div>
            <h2 className="font-bold text-slate-100">AI Setup Assistant</h2>
            <p className="text-xs text-slate-400">Ask me to configure your metronome</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-accent" />
                </div>
            )}

            <div 
              className={`
                max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-accent text-slate-900 rounded-tr-sm font-medium' 
                  : 'bg-slate-700 text-slate-200 rounded-tl-sm border border-slate-600'}
              `}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                    <User size={14} className="text-slate-300" />
                </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                 <Bot size={14} className="text-accent" />
             </div>
             <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-600 flex items-center">
                <Loader2 size={16} className="animate-spin text-accent" />
                <span className="ml-2 text-xs text-slate-400">Processing...</span>
             </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-slate-800/80 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your music (e.g. 'Fast Swing in 4/4')..."
              className="flex-1 bg-slate-900/80 border border-slate-600 hover:border-slate-500 focus:border-accent rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-500"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 bg-accent hover:bg-accent_glow disabled:opacity-50 disabled:hover:bg-accent text-slate-900 px-3 rounded-lg transition-colors flex items-center justify-center"
            >
              <Send size={18} />
            </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;