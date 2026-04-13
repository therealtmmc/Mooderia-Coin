import React from 'react';
import { Shield, ChevronRight, PieChart, Target, Smile, Wallet } from 'lucide-react';
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
          The ultimate offline finance tracker. Designed to work seamlessly as a standalone app or connected directly within the main Mooderia ecosystem.
        </p>

        {/* Feature Showcase */}
        <div className="w-full text-left space-y-4 mb-10">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 text-center">Core Features</h2>
          
          <div className="clay-card p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white text-sm mb-1">Expense Tracking</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">Log your daily income and expenses instantly. Keep your accounts organized in one secure place.</p>
            </div>
          </div>

          <div className="clay-card p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white text-sm mb-1">Smart Budgeting</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">Set monthly limits for different categories and visualize your spending habits with intuitive charts.</p>
            </div>
          </div>

          <div className="clay-card p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white text-sm mb-1">Financial Goals</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">Create custom saving targets and track your progress as you put money aside for what matters.</p>
            </div>
          </div>

          <div className="clay-card p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
              <Smile size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white text-sm mb-1">Mood Integration</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">Link your transactions to your current mood to understand emotional spending patterns.</p>
            </div>
          </div>

          <div className="clay-card p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white text-sm mb-1">100% Offline & Private</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">Your financial data never leaves your device. It works completely offline for maximum security.</p>
            </div>
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
