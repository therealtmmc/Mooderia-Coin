import React, { useState } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Lock, UserPlus, ArrowRight, Delete, Globe } from 'lucide-react';
import { COUNTRIES } from '../lib/countries';

export default function AuthPage({ onUnlock }: { onUnlock: () => void }) {
  const users = useLiveQuery(() => db.users.toArray());
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [country, setCountry] = useState('US');
  const [error, setError] = useState('');

  if (users === undefined) return null; // loading

  const isSignUp = users.length === 0;

  const handleKeypadPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!username || !pin || !country) {
        setError('Please fill all fields');
        return;
      }
      if (pin.length !== 6) {
        setError('PIN must be exactly 6 digits');
        return;
      }
      
      const selectedCountry = COUNTRIES.find(c => c.code === country);
      
      await db.users.add({
        id: crypto.randomUUID(),
        username,
        pin,
        isAppLockEnabled: false,
        country: selectedCountry?.name,
        currency: selectedCountry?.currency || '$'
      });
      
      // Create a default account for the new user
      await db.accounts.add({
        id: 'default',
        name: 'Main Account',
        balance: 0
      });
      
      onUnlock();
    } else {
      const user = users[0];
      if (pin === user.pin) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm clay-card p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-100 dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(124,58,237,0.2)]">
          {isSignUp ? <UserPlus size={36} className="text-white" /> : <Lock size={36} className="text-white" />}
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          {isSignUp ? 'Mooderia' : 'Welcome Back!'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold">
          {isSignUp ? 'Create your offline profile' : 'Enter your PIN to unlock'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 clay-input text-center font-bold text-lg"
              />
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                  <Globe size={20} />
                </div>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-4 pl-12 clay-input font-bold text-lg appearance-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-6 h-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < pin.length ? 'bg-primary scale-110' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Custom Keypad */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num.toString())}
                  className="p-4 text-2xl font-black rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white active:scale-95 transition-transform"
                >
                  {num}
                </button>
              ))}
              <div className="p-4"></div>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="p-4 text-2xl font-black rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white active:scale-95 transition-transform"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-4 flex items-center justify-center text-gray-500 dark:text-gray-400 active:scale-95 transition-transform"
              >
                <Delete size={28} />
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 font-bold text-sm animate-in slide-in-from-top-2">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full py-4 btn-primary text-lg mt-4"
            disabled={pin.length !== 6 || (isSignUp && !username)}
          >
            {isSignUp ? 'Create Profile' : 'Unlock'} <ArrowRight size={20} className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
