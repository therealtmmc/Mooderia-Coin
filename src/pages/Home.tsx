import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, parseISO, subDays, getDaysInMonth, isWeekend } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Smile, Meh, Frown, Coffee, ShoppingBag, Home as HomeIcon, Car, Zap, MoreHorizontal, Sparkles, User, AlertTriangle, Lightbulb, TrendingUp, Calendar } from 'lucide-react';
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

// --- Smart Assist Components ---

function AssistCard({ icon: Icon, title, content, subContent, colorClass = "text-primary", bgClass = "bg-primary/10", children }: any) {
  return (
    <div className="clay-card p-5 flex flex-col gap-1 active:scale-[0.98] transition-transform cursor-pointer shrink-0 w-64 snap-center">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-full", bgClass, colorClass)}>
          <Icon size={14} strokeWidth={3} />
        </div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</h3>
      </div>
      <div className="font-black text-gray-900 dark:text-white text-lg leading-tight">
        {content}
      </div>
      {subContent && <div className="text-sm font-bold text-gray-500 mt-1">{subContent}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function ProgressBar({ progress, colorClass }: { progress: number, colorClass: string }) {
  return (
    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-1">
      <div 
        className={cn("h-full transition-all duration-1000 ease-out", colorClass)} 
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
}

export default function HomePage() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray());
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const budgets = useLiveQuery(() => db.budgets.toArray());
  const users = useLiveQuery(() => db.users.toArray());
  const user = users?.[0];
  const currency = user?.currency || '$';
  
  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const currentMonthStr = format(today, 'yyyy-MM');
  
  const expenses = transactions?.filter(t => t.type === 'expense') || [];
  const todaysTransactions = transactions?.filter(t => t.date.startsWith(todayStr)) || [];
  
  const todaySpent = todaysTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const todayIncome = todaysTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  // --- Money Status Tracking ---
  let maxBudgetProgress = 0;
  let globalDaysLeft = -1;

  // --- Smart Assist Logic ---
  const assistCards = [];

  // 1. Budget Pressure
  const currentMonthBudgets = budgets?.filter(b => b.month === currentMonthStr) || [];
  if (currentMonthBudgets.length > 0) {
    const currentMonthExpenses = expenses.filter(t => t.date.startsWith(currentMonthStr));
    
    for (const budget of currentMonthBudgets) {
      const spent = currentMonthExpenses.filter(t => t.category === budget.category).reduce((sum, t) => sum + t.amount, 0);
      const progress = (spent / budget.limit) * 100;
      maxBudgetProgress = Math.max(maxBudgetProgress, progress);
      
      if (progress >= 70) {
        let colorClass = "bg-primary";
        let iconColor = "text-primary";
        let iconBg = "bg-primary/10";
        
        if (progress >= 90) {
          colorClass = "bg-red-500";
          iconColor = "text-red-500";
          iconBg = "bg-red-500/10";
        } else if (progress >= 70) {
          colorClass = "bg-orange-500";
          iconColor = "text-orange-500";
          iconBg = "bg-orange-500/10";
        }

        assistCards.push({
          id: `budget-${budget.id}`,
          priority: progress >= 90 ? 1 : 2,
          component: (
            <AssistCard 
              key={`budget-${budget.id}`}
              icon={AlertTriangle} 
              title="Budget Pressure" 
              content={`${budget.category} is at ${Math.round(progress)}%`}
              colorClass={iconColor}
              bgClass={iconBg}
            >
              <ProgressBar progress={progress} colorClass={colorClass} />
            </AssistCard>
          )
        });
      }
    }
  }

  // 2. Daily Spending Limit & Days Until Broke
  const daysInMonth = getDaysInMonth(today);
  const remainingDays = daysInMonth - today.getDate() + 1;
  const dailyLimit = totalBalance > 0 ? totalBalance / remainingDays : 0;
  
  // Calculate average daily spend over the last 30 days
  const thirtyDaysAgo = format(subDays(today, 30), 'yyyy-MM-dd');
  const recentExpenses = expenses.filter(t => t.date >= thirtyDaysAgo);
  const totalRecentSpend = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const avgDailySpend = totalRecentSpend / 30;
  const daysLeft = avgDailySpend > 0 ? Math.floor(totalBalance / avgDailySpend) : 0;
  globalDaysLeft = daysLeft;

  const dailyProgress = dailyLimit > 0 ? (todaySpent / dailyLimit) * 100 : 0;
  
  assistCards.push({
    id: 'daily-limit',
    priority: dailyProgress > 80 ? 1 : 2,
    component: (
      <AssistCard 
        key="daily-limit"
        icon={TrendingUp} 
        title="Daily Limit" 
        content={dailyLimit > 0 ? `${currency}${Math.max(0, dailyLimit - todaySpent).toFixed(0)}` : `${currency}0`}
        subContent="left to spend today"
      >
         {dailyLimit > 0 && <ProgressBar progress={dailyProgress} colorClass={dailyProgress > 90 ? "bg-red-500" : "bg-primary"} />}
      </AssistCard>
    )
  });

  assistCards.push({
    id: 'days-broke',
    priority: daysLeft > 0 && daysLeft < 7 ? 1 : 3,
    component: (
      <AssistCard 
        key="days-broke"
        icon={Calendar} 
        title="Runway" 
        content={daysLeft > 0 ? `You can last ${daysLeft} days` : "Needs more data"}
        subContent={daysLeft > 0 ? "at current spending rate" : "Track expenses to calculate"}
        colorClass="text-orange-500"
        bgClass="bg-orange-500/10"
      />
    )
  });

  // 3. Spending Habit (Weekend vs Weekday)
  if (expenses.length > 10) {
    const weekendSpend = expenses.filter(t => isWeekend(parseISO(t.date))).reduce((sum, t) => sum + t.amount, 0);
    const weekdaySpend = expenses.filter(t => !isWeekend(parseISO(t.date))).reduce((sum, t) => sum + t.amount, 0);
    
    // Normalize by days (2 weekend days, 5 weekdays)
    const avgWeekendDay = weekendSpend / 2;
    const avgWeekdayDay = weekdaySpend / 5;

    if (avgWeekendDay > avgWeekdayDay * 1.5) {
      assistCards.push({
        id: 'habit-weekend',
        priority: 4,
        component: (
          <AssistCard 
            key="habit-weekend"
            icon={Sparkles} 
            title="Habit Detected" 
            content="You spend significantly more on weekends."
          />
        )
      });
    }
  }

  // 4. Mood Insight (Upgraded)
  const expensesWithMood = expenses.filter(t => t.mood);
  if (expensesWithMood.length > 5) {
    const moodTotals = expensesWithMood.reduce((acc, t) => {
      acc[t.mood!] = (acc[t.mood!] || { sum: 0, count: 0 });
      acc[t.mood!].sum += t.amount;
      acc[t.mood!].count += 1;
      return acc;
    }, {} as Record<string, { sum: number, count: number }>);

    const averages = Object.entries(moodTotals).map(([mood, data]) => ({
      mood,
      avg: data.sum / data.count
    })).sort((a, b) => b.avg - a.avg);

    if (averages.length >= 2 && averages[0].avg > averages[1].avg * 1.1) {
      const topMood = averages[0].mood;
      const emoji = topMood === 'sad' ? '😔' : topMood === 'happy' ? '😊' : '😐';
      const percentMore = Math.round(((averages[0].avg - averages[1].avg) / averages[1].avg) * 100);
      
      assistCards.push({
        id: 'mood-insight',
        priority: 4,
        component: (
          <AssistCard 
            key="mood-insight"
            icon={Smile} 
            title="Mood Insight" 
            content={`You spend ${percentMore}% more when ${topMood} ${emoji}`}
          />
        )
      });
    }
  }

  // 5. Always include 1 Smart Tip
  const tips = [
    { main: "Skip 1 milk tea", sub: `Save ${currency}120` },
    { main: "Wait 24h before buying", sub: "Avoid impulse purchases" },
    { main: "Pack lunch twice a week", sub: `Save ${currency}500` },
    { main: "Review subscriptions", sub: "Cancel what you don't use" }
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  assistCards.push({
    id: 'smart-tip',
    priority: 5, // Lowest priority, but always added
    component: (
      <AssistCard 
        key="smart-tip"
        icon={Lightbulb} 
        title="Smart Tip" 
        content={randomTip.main}
        subContent={randomTip.sub}
        colorClass="text-yellow-500"
        bgClass="bg-yellow-500/10"
      />
    )
  });

  // --- Money Status Logic ---
  let moneyStatus = { label: 'Stable', icon: '😊', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', message: "You're managing your money well" };
  if (maxBudgetProgress >= 90 || (globalDaysLeft > 0 && globalDaysLeft < 7)) {
    moneyStatus = { label: 'Risk', icon: '😔', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', message: "Watch your spending closely" };
  } else if (maxBudgetProgress >= 75 || (globalDaysLeft > 0 && globalDaysLeft < 14)) {
    moneyStatus = { label: 'Careful', icon: '😐', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', message: "You're nearing your limits" };
  }

  // Sort by priority and take top 3
  const displayCards = assistCards.sort((a, b) => a.priority - b.priority).slice(0, 3).map(c => c.component);


  return (
    <div className="p-6 pb-32 min-h-screen animate-in fade-in duration-300">
      {/* 1. Top Section */}
      <header className="mb-8 pt-4 flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-6">
          <div className="flex items-center gap-3">
             <Link to="/settings" className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-100 flex items-center justify-center active:scale-95 transition-transform">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-gray-400" />
              )}
            </Link>
            <div>
              <p className="text-xs font-bold text-gray-500">Hello,</p>
              <p className="text-sm font-black text-gray-900 dark:text-white">{user?.username || 'User'}</p>
            </div>
          </div>
        </div>
        
        <div className="text-center flex flex-col items-center mb-6">
          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2", moneyStatus.bg)}>
            <span className="text-sm">{moneyStatus.icon}</span>
            <span className={cn("text-[10px] font-black uppercase tracking-wider", moneyStatus.color)}>{moneyStatus.label}</span>
          </div>
          <p className="text-xs font-bold text-gray-500 mb-4">{moneyStatus.message}</p>
          <h1 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Balance</h1>
          <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            {currency}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-green-500">+{currency}{todayIncome.toFixed(0)} today</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-red-500">-{currency}{todaySpent.toFixed(0)} spent</span>
          </div>
        </div>
      </header>

      {/* 2. Smart Assist Section */}
      {displayCards.length > 0 && (
        <div className="mb-8 -mx-6">
          <div className="px-6 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h2 className="text-sm font-black text-gray-900 dark:text-white">Smart Assist</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory hide-scrollbar">
            {displayCards}
          </div>
        </div>
      )}

      {/* 3. Today Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="clay-card p-4 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-2">
            <ArrowDownRight size={16} className="text-red-500" strokeWidth={3} />
          </div>
          <span className="text-xs font-bold text-gray-500 mb-1">Today's Spend</span>
          <div className="text-lg font-black text-gray-900 dark:text-white">
            {currency}{todaySpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="clay-card p-4 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-2">
            <ArrowUpRight size={16} className="text-green-500" strokeWidth={3} />
          </div>
          <span className="text-xs font-bold text-gray-500 mb-1">Today's Income</span>
          <div className="text-lg font-black text-gray-900 dark:text-white">
            {currency}{todayIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black text-gray-900 dark:text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs font-bold text-primary active:scale-95 transition-transform">View All</Link>
        </div>

        <div className="space-y-3">
          {(!transactions || transactions.length === 0) ? (
            <div className="text-center py-8 text-gray-400 text-sm font-bold clay-card">
              No transactions yet. Add one!
            </div>
          ) : (
            transactions.slice(0, 5).map((t) => {
              const Icon = CATEGORY_ICONS[t.category] || CATEGORY_ICONS['Other'];
              const isExpense = t.type === 'expense';
              
              return (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-4 clay-card active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-100 dark:border-gray-800",
                      isExpense ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                    )}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-black text-sm text-gray-900 dark:text-white">{t.category}</div>
                      <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mt-0.5">
                        {format(parseISO(t.date), 'MMM d')}
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
                    "font-black text-base",
                    isExpense ? "text-gray-900 dark:text-white" : "text-green-600"
                  )}>
                    {isExpense ? '-' : '+'}{currency}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
