import React from 'react';
import { Share, MoreVertical, PlusSquare } from 'lucide-react';
import { Link } from 'react-router';

export default function InstallPrompt({ onBypass }: { onBypass?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-center animate-in fade-in duration-500">
      <div className="w-full max-w-sm clay-card p-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 border-4 border-gray-100 dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(124,58,237,0.2)]">
          <PlusSquare size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Install Mooderia</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold">
          To keep your data 100% offline and secure, please add Mooderia to your home screen.
        </p>

        <div className="text-left w-full space-y-6 mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              🍎 iOS (Safari)
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-3 list-decimal list-inside font-medium">
              <li>Tap the <Share size={16} className="inline mx-1 text-primary" /> Share button at the bottom.</li>
              <li>Scroll down and tap <strong className="text-gray-900 dark:text-white">Add to Home Screen</strong>.</li>
            </ol>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              🤖 Android (Chrome)
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-3 list-decimal list-inside font-medium">
              <li>Tap the <MoreVertical size={16} className="inline mx-1 text-primary" /> Menu button at the top right.</li>
              <li>Tap <strong className="text-gray-900 dark:text-white">Add to Home screen</strong> or <strong className="text-gray-900 dark:text-white">Install app</strong>.</li>
            </ol>
          </div>
        </div>

        {onBypass && (
          <button 
            onClick={onBypass} 
            className="text-primary font-bold text-sm underline mb-6 hover:text-primary/80 transition-colors"
          >
            Continue in Browser (Preview Mode)
          </button>
        )}

        <div className="flex gap-4 text-xs font-bold text-gray-400 mt-auto pt-4 border-t-2 border-gray-100 dark:border-gray-800 w-full justify-center">
          <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
