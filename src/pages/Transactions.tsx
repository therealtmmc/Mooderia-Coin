import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, parseISO } from 'date-fns';
import { Coffee, ShoppingBag, Home as HomeIcon, Car, Zap, MoreHorizontal, Smile, Meh, Frown, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

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

export default function TransactionsPage() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray());
  const users = useLiveQuery(() => db.users.toArray());
  const user = users?.[0];
  const currency = user?.currency || '$';
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<{id: string, amount: number, type: string} | null>(null);

  const handleDeleteClick = (id: string, amount: number, type: string) => {
    setTransactionToDelete({ id, amount, type });
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      const { id, amount, type } = transactionToDelete;
      await db.transactions.delete(id);
      
      // Update account balance
      const account = await db.accounts.get('default');
      if (account) {
        const newBalance = type === 'expense' 
          ? account.balance + amount // revert expense
          : account.balance - amount; // revert income
        await db.accounts.update('default', { balance: newBalance });
      }
      setIsConfirmDeleteOpen(false);
      setTransactionToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 min-h-screen animate-in slide-in-from-right-4 duration-300">
      <header className="bg-white dark:bg-gray-900 p-4 flex items-center gap-4 sticky top-0 z-10 border-b-4 border-gray-100 dark:border-gray-800">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">All Transactions</h1>
      </header>

      <div className="p-4 space-y-4 pb-24">
        {transactions?.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold animate-in zoom-in-95 duration-500">
            No transactions found.
          </div>
        ) : (
          transactions?.map((t, i) => {
            const Icon = CATEGORY_ICONS[t.category] || CATEGORY_ICONS['Other'];
            const isExpense = t.type === 'expense';
            
            return (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-4 clay-card group animate-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${i * 50}ms` }}
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
                    <div className="text-xs font-bold text-gray-500 flex items-center gap-2 mt-0.5">
                      {format(parseISO(t.date), 'MMM d, yyyy')}
                      {t.mood && (
                        <>
                          <span>•</span>
                          {MOOD_ICONS[t.mood]}
                        </>
                      )}
                    </div>
                    {t.note && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-bold">"{t.note}"</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    "font-black text-lg",
                    isExpense ? "text-gray-900 dark:text-white" : "text-green-600"
                  )}>
                    {isExpense ? '-' : '+'}{currency}{t.amount.toFixed(2)}
                  </div>
                  <button 
                    onClick={() => handleDeleteClick(t.id, t.amount, t.type)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 active:scale-95"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? Your balance will be updated accordingly."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
}
