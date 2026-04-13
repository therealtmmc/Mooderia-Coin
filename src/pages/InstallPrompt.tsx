import React from 'react';
import { Share, MoreVertical, Shield, Zap, Smartphone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export default function InstallPrompt({ onBypass }: { onBypass?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-center animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-md py-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
        {/* Hero / Introduction */}
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 border-4 border-white dark:border-gray-800 shadow-[0_8px_16px_rgba(124,58,237,0.3)] overflow-hidden">
          <img src="/mooderiacoin.png" alt="Mooderia Coin Logo" className="w-full h-full object-cover" onError={(e) => {
            // Fallback if image is not uploaded yet
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>';
          }} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Mooderia Coin
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold text-sm px-4">
          Your smart, 100% offline money assistant. To ensure your financial data stays private and secure on your device, Mooderia must be installed as an app.
        </p>

        {/* Features/Why Install */}
        <div className="flex justify-center gap-4 mb-10 w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-gray-500">Private</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-gray-500">Fast</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-gray-500">App-like</span>
          </div>
        </div>

        {/* Installation Guide */}
        <div className="w-full text-left space-y-4 mb-10">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 text-center">How to Install</h2>
          
          <div className="clay-card p-5">
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              🍎 iOS (Safari)
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-4 font-bold">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xs">1</div>
                <span>Tap the <Share size={16} className="inline mx-1 text-primary" /> Share button at the bottom.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xs">2</div>
                <span>Scroll down and tap <strong className="text-gray-900 dark:text-white">Add to Home Screen</strong>.</span>
              </li>
            </ol>
          </div>

          <div className="clay-card p-5">
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              🤖 Android (Chrome)
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-4 font-bold">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xs">1</div>
                <span>Tap the <MoreVertical size={16} className="inline mx-1 text-primary" /> Menu button at the top right.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xs">2</div>
                <span>Tap <strong className="text-gray-900 dark:text-white">Add to Home screen</strong> or <strong className="text-gray-900 dark:text-white">Install app</strong>.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Legal Links */}
        <div className="w-full flex flex-col gap-3 mb-8">
          <Link to="/terms" className="w-full p-4 clay-card flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 active:scale-[0.98] transition-all">
            <span className="font-bold text-gray-900 dark:text-white text-sm">Terms & Conditions</span>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <Link to="/privacy" className="w-full p-4 clay-card flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 active:scale-[0.98] transition-all">
            <span className="font-bold text-gray-900 dark:text-white text-sm">Privacy Policy</span>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </div>

        {onBypass && (
          <button 
            onClick={onBypass} 
            className="text-gray-400 font-bold text-xs underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Continue in Browser (Preview Mode)
          </button>
        )}
      </div>
    </div>
  );
}
