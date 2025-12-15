import React, { useState, useEffect } from 'react';
import { Download, Share, X, PlusSquare } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Android/Desktop Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  if (isStandalone) return null;
  // If not iOS and no prompt event (e.g. Firefox desktop or already dismissed), hide button
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-full text-xs font-bold text-accent transition-all active:scale-95 animate-in fade-in shadow-lg backdrop-blur-sm z-50"
      >
        <Download size={16} />
        <span className="hidden md:inline">Install App</span>
        <span className="md:hidden">Install</span>
      </button>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <button 
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
                <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4">加入主畫面</h3>
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>將此 App 安裝到您的 iPhone/iPad 以獲得最佳體驗：</p>
                <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <Share size={24} className="text-blue-500 shrink-0" />
                    <span>1. 點擊瀏覽器下方的 <strong>分享</strong> 按鈕。</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="w-6 h-6 border-2 border-slate-500 rounded flex items-center justify-center shrink-0">
                        <PlusSquare size={14} className="text-slate-500" />
                    </div>
                    <span>2. 往下滑並選擇 <strong>加入主畫面</strong>。</span>
                </div>
            </div>
            <div className="mt-6 text-center">
                <button 
                    onClick={() => setShowIOSInstructions(false)}
                    className="text-slate-900 bg-accent hover:bg-accent_glow font-bold text-sm px-6 py-2 rounded-full transition-colors"
                >
                    知道了
                </button>
            </div>
            
            {/* Pointer for bottom bar (Safari default context) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-b border-r border-slate-700 rotate-45 md:hidden"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;