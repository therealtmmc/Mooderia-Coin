import { useState } from 'react';
import { useNavigate } from 'react-router';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Coffee, ShoppingBag, Home as HomeIcon, Car, Zap, MoreHorizontal, Smile, Meh, Frown, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  { id: 'Food', icon: Coffee },
  { id: 'Shopping', icon: ShoppingBag },
  { id: 'Housing', icon: HomeIcon },
  { id: 'Transport', icon: Car },
  { id: 'Utilities', icon: Zap },
  { id: 'Other', icon: MoreHorizontal },
];

const MOODS = [
  { id: 'happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-500' },
  { id: 'neutral', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-500' },
  { id: 'sad', icon: Frown, iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-500' },
];

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const users = useLiveQuery(() => db.users.toArray());
  const user = users?.[0];
  const currency = user?.currency || '$';
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Food');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | undefined>();
  const [note, setNote] = useState('');

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;

    await db.transactions.add({
      id: crypto.randomUUID(),
      amount: Number(amount),
      type,
      category,
      account: 'default', // Simplification for now
      date: new Date().toISOString(),
      note,
      mood,
    });

    // Update account balance
    const account = await db.accounts.get('default');
    if (account) {
      const newBalance = type === 'expense' 
        ? account.balance - Number(amount)
        : account.balance + Number(amount);
      await db.accounts.update('default', { balance: newBalance });
    } else {
      // Create default account if it doesn't exist
      await db.accounts.add({
        id: 'default',
        name: 'Main Account',
        balance: type === 'expense' ? -Number(amount) : Number(amount)
      });
    }

    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 min-h-screen animate-in slide-in-from-top-4 duration-300">
      <header className="p-4 flex items-center gap-4 border-b-4 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Add Transaction</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        {/* Type Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-8 border-4 border-transparent">
          <button
            onClick={() => setType('expense')}
            className={cn(
              "flex-1 py-2 text-sm font-black rounded-xl transition-all active:scale-95",
              type === 'expense' ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"
            )}
          >
            Expense
          </button>
          <button
            onClick={() => setType('income')}
            className={cn(
              "flex-1 py-2 text-sm font-black rounded-xl transition-all active:scale-95",
              type === 'income' ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"
            )}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-8 text-center clay-card p-6">
          <div className="text-gray-400 text-sm font-black uppercase tracking-wider mb-2">Amount</div>
          <div className="flex items-center justify-center text-5xl font-black text-gray-900 dark:text-white">
            <span className="text-gray-400 mr-1">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full max-w-[200px] bg-transparent outline-none text-center placeholder:text-gray-300 dark:placeholder:text-gray-700"
              autoFocus
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Category</div>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all active:scale-95",
                    isSelected 
                      ? "border-primary bg-primary text-white shadow-[4px_4px_0px_0px_rgba(124,58,237,0.2)]" 
                      : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <Icon size={24} className="mb-2" strokeWidth={isSelected ? 3 : 2} />
                  <span className="text-[10px] font-black">{cat.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood */}
        <div className="mb-8">
          <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">How did this make you feel? (Optional)</div>
          <div className="flex gap-4">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const isSelected = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(isSelected ? undefined : m.id as any)}
                  className={cn(
                    "flex-1 flex justify-center items-center py-3 rounded-2xl border-4 transition-all active:scale-95",
                    isSelected ? cn(m.bg, m.border, m.color || m.iconColor, "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]") : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <Icon size={28} strokeWidth={isSelected ? 3 : 2} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="mb-8">
          <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Note (Optional)</div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was this for?"
            className="w-full p-4 clay-input text-gray-900 font-bold"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!amount || isNaN(Number(amount))}
          className="w-full py-4 btn-primary text-lg"
        >
          Save Transaction
        </button>
      </div>
    </div>
  );
}
