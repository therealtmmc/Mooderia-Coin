import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, parseISO } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Smile, Meh, Frown, Coffee, ShoppingBag, Home as HomeIcon, Car, Zap, MoreHorizontal, Sparkles, User } from 'lucide-react';
import { Link } from 'react-router';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_ICONS: Record<string, any> = {
  'Food': Coffee,
  'Shopping': ShoppingBag,
  'Housing': HomeIcon,
  'Transport': Car,
  'Utilities': Zap,
  'Other': MoreHorizontal,
};

const MOOD_ICONS = {
  'happy': <Smile className="text-green-500" size={16} />,
  'neutral': <Meh className="text-yellow-500" size={16} />,
  'sad': <Frown className="text-blue-500" size={16} />,
};

export default function HomePage() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray());
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const users = useLiveQuery(() => db.users.toArray());
  const user = users?.[0];
  
  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  
  // Calculate today's spending
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysTransactions = transactions?.filter(t => t.date.startsWith(today)) || [];
  
  const todaySpent = todaysTransactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const todayIncome = todaysTransactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  // Simple Mood Insight
  const expensesWithMood = transactions?.filter(t => t.type === 'expense' && t.mood) || [];
  let insightText = "Track your mood with expenses to see insights!";
  
  if (expensesWithMood.length > 0) {
    const moodCounts = expensesWithMood.reduce((acc, t) => {
      acc[t.mood!] = (acc[t.mood!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
    
    if (mostFrequentMood === 'sad') {
      insightText = "You tend to spend more when you're feeling sad.";
    } else if (mostFrequentMood === 'happy') {
      insightText = "Most of your spending happens when you're happy!";
    } else {
      insightText = "Your spending is mostly neutral.";
    }
  }

  return (
    <div className="p-6 pb-32 min-h-screen animate-in fade-in duration-500">
      <header className="mb-8 pt-4 flex justify-between items-start animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <div>
          <h1 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-1">Total Balance</h1>
          <div className="text-4xl font-black text-gray-900 dark:text-white">
            ${totalBalance.toFixed(2)}
          </div>
        </div>
        <Link to="/settings" className="w-12 h-12 rounded-full border-4 border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-100 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(124,58,237,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(124,58,237,0.2)] active:scale-95 transition-transform">
          {user?.profilePic ? (
            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-gray-400" />
          )}
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <div className="clay-card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ArrowDownRight size={16} className="text-red-500" strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-wider">Today's Spend</span>
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            ${todaySpent.toFixed(2)}
          </div>
        </div>
        <div className="clay-card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ArrowUpRight size={16} className="text-green-500" strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-wider">Income</span>
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            ${todayIncome.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Mood Insight Card */}
      <div className="clay-card p-4 mb-8 flex items-start gap-3 !bg-primary/5 !border-primary/20 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
        <div className="bg-white dark:bg-gray-900 p-2 rounded-full text-primary border-4 border-gray-100 dark:border-gray-800">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1">Mood Insight</h3>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{insightText}</p>
        </div>
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-primary font-black active:scale-95 transition-transform">See all</Link>
        </div>

        <div className="space-y-4">
          {(!transactions || transactions.length === 0) ? (
            <div className="text-center py-8 text-gray-400 text-sm font-bold">
              No transactions yet. Add one!
            </div>
          ) : (
            transactions.slice(0, 5).map((t, i) => {
              const Icon = CATEGORY_ICONS[t.category] || CATEGORY_ICONS['Other'];
              const isExpense = t.type === 'expense';
              
              return (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-4 clay-card active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${600 + i * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-4 border-gray-100 dark:border-gray-800",
                      isExpense ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                    )}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 dark:text-white">{t.category}</div>
                      <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                        {format(parseISO(t.date), 'MMM d, yyyy')}
                        {t.mood && (
                          <>
                            <span>•</span>
                            {MOOD_ICONS[t.mood]}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-black text-lg",
                    isExpense ? "text-gray-900 dark:text-white" : "text-green-600"
                  )}>
                    {isExpense ? '-' : '+'}${t.amount.toFixed(2)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
