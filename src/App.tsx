/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { Home, Plus, PieChart, Target, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Pages
import HomePage from './pages/Home';
import AddTransactionPage from './pages/AddTransaction';
import BudgetPage from './pages/Budget';
import GoalsPage from './pages/Goals';
import SettingsPage from './pages/Settings';
import TransactionsPage from './pages/Transactions';
import AuthPage from './pages/Auth';
import TermsPage from './pages/Terms';
import PrivacyPage from './pages/Privacy';
import InstallPrompt from './pages/InstallPrompt';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function BottomNav() {
  const location = useLocation();
  
  // Don't show bottom nav on add transaction or all transactions pages
  if (location.pathname === '/add' || location.pathname === '/transactions' || location.pathname === '/terms' || location.pathname === '/privacy') {
    return null;
  }
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/budget', icon: PieChart, label: 'Budget' },
    { path: '/add', icon: Plus, label: 'Add', isFab: true },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-[95%] max-w-md nav-glass rounded-[2.5rem] pointer-events-auto shadow-lg shadow-gray-200/50 dark:shadow-black/50">
        <div className="flex justify-around items-center h-16 px-2 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            if (item.isFab) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-[0_8px_16px_rgba(124,58,237,0.4)] active:scale-90 active:shadow-none transition-all duration-300"
                >
                  <Icon size={28} />
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center w-16 h-full transition-colors font-bold z-10",
                  isActive ? "text-primary" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-1 bg-primary/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
                <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const users = useLiveQuery(() => db.users.toArray());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const location = useLocation();

  const isIframe = window !== window.parent;
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true
  );
  const [bypassed, setBypassed] = useState(false);

  // Initialize dark mode
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Standalone listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches || (window.navigator as any).standalone === true);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-unlock if no app lock
  useEffect(() => {
    if (users && users.length > 0) {
      if (!users[0].isAppLockEnabled) {
        setIsUnlocked(true);
      }
    }
  }, [users]);

  if (users === undefined) return null; // loading

  // Allow terms and privacy to be viewed anytime
  if (location.pathname === '/terms' || location.pathname === '/privacy') {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950">
          <Routes>
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Standalone check
  if (!isStandalone && !bypassed) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950">
           <InstallPrompt onBypass={isIframe ? () => setBypassed(true) : undefined} />
        </div>
      </div>
    );
  }

  const needsAuth = users.length === 0 || (users.length > 0 && users[0].isAppLockEnabled && !isUnlocked);

  if (needsAuth) {
    return (
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950">
        <AuthPage onUnlock={() => setIsUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add" element={<AddTransactionPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
}
