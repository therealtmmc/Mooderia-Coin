import { useLiveQuery } from 'dexie-react-hooks';
import { db, Budget } from '../db';
import { format } from 'date-fns';
import { Coffee, ShoppingBag, Home as HomeIcon, Car, Zap, MoreHorizontal, Plus, Edit2, X, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React, { useState } from 'react';
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

const CATEGORIES = Object.keys(CATEGORY_ICONS);

export default function BudgetPage() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  const transactions = useLiveQuery(() => 
    db.transactions
      .where('date')
      .startsWith(currentMonth)
      .toArray()
  );

  const budgets = useLiveQuery(() => 
    db.budgets
      .where('month')
      .equals(currentMonth)
      .toArray()
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');

  const openAddModal = () => {
    setEditingBudget(null);
    setCategory(CATEGORIES[0]);
    setLimit('');
    setIsModalOpen(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setLimit(budget.limit.toString());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return;

    if (editingBudget) {
      await db.budgets.update(editingBudget.id, {
        category,
        limit: Number(limit)
      });
    } else {
      // Check if budget for this category already exists this month
      const existing = budgets?.find(b => b.category === category);
      if (existing) {
        await db.budgets.update(existing.id, {
          limit: Number(limit)
        });
      } else {
        await db.budgets.add({
          id: crypto.randomUUID(),
          category,
          limit: Number(limit),
          month: currentMonth
        });
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (editingBudget) {
      await db.budgets.delete(editingBudget.id);
      setIsConfirmDeleteOpen(false);
      setIsModalOpen(false);
    }
  };

  // Calculate spending per category
  const spendingByCategory = transactions?.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="p-6 pb-32 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8 pt-4 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Budget</h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center border-4 border-gray-100 dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(124,58,237,0.2)] active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      {(!budgets || budgets.length === 0) ? (
        <div className="text-center py-12 px-4 clay-card animate-in zoom-in-95 duration-500 delay-100">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-900 dark:text-white">
            <Zap size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No budgets yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-bold">Set up budgets to keep your spending in check.</p>
          <button 
            onClick={openAddModal}
            className="px-6 py-4 btn-primary w-full"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {budgets.map((budget, i) => {
            const spent = spendingByCategory[budget.category] || 0;
            const remaining = budget.limit - spent;
            const percent = Math.min((spent / budget.limit) * 100, 100);
            const isNearLimit = percent > 80;
            const isOverLimit = percent >= 100;
            const Icon = CATEGORY_ICONS[budget.category] || CATEGORY_ICONS['Other'];

            return (
              <div 
                key={budget.id} 
                className="clay-card p-5 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both relative group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <button 
                  onClick={() => openEditModal(budget)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors border-2 border-gray-200 dark:border-gray-700"
                >
                  <Edit2 size={14} strokeWidth={3} />
                </button>

                <div className="flex justify-between items-center mb-4 pr-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white shrink-0">
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="font-black text-lg text-gray-900 dark:text-white">{budget.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xl text-gray-900 dark:text-white">${spent.toFixed(2)}</div>
                    <div className="text-xs font-bold text-gray-500">of ${budget.limit}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2 border-2 border-gray-200 dark:border-gray-700">
                  <div 
                    className={cn(
                      "h-full rounded-r-full transition-all duration-500",
                      isOverLimit ? "bg-red-500" : isNearLimit ? "bg-primary-dark" : "bg-primary"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs font-black">
                  <span className={isOverLimit ? "text-red-500" : "text-gray-500"}>
                    {isOverLimit ? 'Over budget' : `${percent.toFixed(0)}% spent`}
                  </span>
                  <span className={isOverLimit ? "text-red-500" : "text-primary"}>
                    ${Math.abs(remaining).toFixed(2)} {isOverLimit ? 'over' : 'left'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] border-4 border-gray-100 dark:border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'New Budget'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-4 clay-input font-bold appearance-none bg-white dark:bg-gray-800"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Monthly Limit ($)</label>
                <input 
                  type="number" 
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full p-4 clay-input font-bold"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                {editingBudget && (
                  <button 
                    type="button"
                    onClick={handleDeleteClick}
                    className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-1 py-4 btn-primary"
                >
                  {editingBudget ? 'Save Changes' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
}
