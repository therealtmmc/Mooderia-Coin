import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 min-h-screen animate-in slide-in-from-right-4 duration-300">
      <header className="p-4 flex items-center gap-4 border-b-4 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Privacy Policy</h1>
      </header>
      <div className="p-6 pb-24 overflow-y-auto">
        <div className="clay-card p-6 space-y-4 animate-in zoom-in-95 duration-500 delay-100">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">1. Data Collection</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Mooderia Coin does not collect, transmit, or store your personal data on any external servers. All data remains on your device.</p>
          
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">2. Local Storage</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">We use local storage (IndexedDB) to save your transactions, budgets, goals, and profile information.</p>
          
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">3. Third-Party Services</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">We do not use any third-party analytics, tracking, or advertising APIs.</p>
          
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">4. Contact</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">For privacy concerns, reach out to <a href="mailto:mooderiasite@gmail.com" className="text-primary font-bold hover:underline">mooderiasite@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
