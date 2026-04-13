import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Download, Shield, FileText, Lock, User, Camera, Edit2, Check, Moon, Sun, Globe } from 'lucide-react';
import { Link } from 'react-router';
import React, { useRef, useState, useEffect } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { COUNTRIES } from '../lib/countries';

export default function SettingsPage() {
  const users = useLiveQuery(() => db.users.toArray());
  const user = users?.[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleResetClick = () => {
    setIsConfirmResetOpen(true);
  };

  const confirmReset = async () => {
    await db.transactions.clear();
    await db.accounts.clear();
    await db.budgets.clear();
    await db.goals.clear();
    await db.users.clear();
    window.location.reload();
  };

  const handleExportData = async () => {
    try {
      const data = {
        transactions: await db.transactions.toArray(),
        accounts: await db.accounts.toArray(),
        budgets: await db.budgets.toArray(),
        goals: await db.goals.toArray(),
        users: await db.users.toArray(),
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mooderia-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await db.users.update(user.id, { profilePic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAppLock = async () => {
    if (user) {
      await db.users.update(user.id, { isAppLockEnabled: !user.isAppLockEnabled });
    }
  };

  const startEditingName = () => {
    if (user) {
      setEditName(user.username);
      setIsEditingName(true);
    }
  };

  const saveName = async () => {
    if (user && editName.trim()) {
      await db.users.update(user.id, { username: editName.trim() });
      setIsEditingName(false);
    }
  };

  return (
    <div className="p-6 pb-32 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <header className="mb-8 pt-4 animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Settings</h1>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Manage your app</p>
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="clay-card p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 delay-100 fill-mode-both">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 active:scale-95 transition-transform"
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-1">
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="clay-input px-3 py-1 text-center font-black text-lg w-40"
                autoFocus
              />
              <button 
                onClick={saveName}
                className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Check size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{user?.username || 'User'}</h2>
              <button 
                onClick={startEditingName}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Edit2 size={16} strokeWidth={3} />
              </button>
            </div>
          )}
          
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Your data stays on this device 🔒</p>
        </section>

        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-2">General</h2>
          <div className="clay-card overflow-hidden">
            <div className="w-full flex items-center justify-between p-4 border-b-2 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                  <Globe size={16} />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Country / Currency</span>
              </div>
              <select
                value={COUNTRIES.find(c => c.name === user?.country)?.code || 'US'}
                onChange={async (e) => {
                  if (user) {
                    const selectedCountry = COUNTRIES.find(c => c.code === e.target.value);
                    if (selectedCountry) {
                      await db.users.update(user.id, { 
                        country: selectedCountry.name,
                        currency: selectedCountry.currency
                      });
                    }
                  }
                }}
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm py-1 px-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 outline-none"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>
            <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b-2 border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                  {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Dark Mode</span>
              </div>
              <div className={`w-12 h-6 rounded-full border-2 relative transition-colors ${isDarkMode ? 'bg-primary border-primary' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
            <button onClick={toggleAppLock} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:bg-gray-100 dark:active:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                  <Shield size={16} />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">App Lock (PIN)</span>
              </div>
              <div className={`w-12 h-6 rounded-full border-2 relative transition-colors ${user?.isAppLockEnabled ? 'bg-primary border-primary' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${user?.isAppLockEnabled ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </section>

        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-2">Legal</h2>
          <div className="clay-card overflow-hidden">
            <Link to="/terms" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b-2 border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                  <FileText size={16} />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Terms & Conditions</span>
              </div>
            </Link>
            <Link to="/privacy" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:bg-gray-100 dark:active:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                  <Lock size={16} />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Privacy Policy</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-2">Data</h2>
          <div className="clay-card overflow-hidden">
            <button onClick={handleExportData} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b-2 border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800">
                  <Download size={16} />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Export Data</span>
              </div>
            </button>
            <button 
              onClick={handleResetClick}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:bg-red-100 dark:active:bg-red-900/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800">
                  <Trash2 size={16} />
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">Reset All Data</span>
              </div>
            </button>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={isConfirmResetOpen}
        title="Reset All Data"
        message="Are you sure you want to delete all your data? This will erase your profile, transactions, budgets, and goals. This action cannot be undone."
        confirmText="Yes, Delete Everything"
        isDestructive={true}
        onConfirm={confirmReset}
        onCancel={() => setIsConfirmResetOpen(false)}
      />
    </div>
  );
}

