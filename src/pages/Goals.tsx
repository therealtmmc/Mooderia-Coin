import { useLiveQuery } from 'dexie-react-hooks';
import { db, Goal } from '../db';
import { Target, Plus, Trophy, Edit2, X, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React, { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function GoalsPage() {
  const goals = useLiveQuery(() => db.goals.toArray());
  const users = useLiveQuery(() => db.users.toArray());
  const user = users?.[0];
  const currency = user?.currency || '$';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const openAddModal = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setCurrentAmount(goal.current_amount.toString());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    if (editingGoal) {
      await db.goals.update(editingGoal.id, {
        name,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0
      });
    } else {
      await db.goals.add({
        id: crypto.randomUUID(),
        name,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (editingGoal) {
      await db.goals.delete(editingGoal.id);
      setIsConfirmDeleteOpen(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6 pb-32 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8 pt-4 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Goals</h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Track your savings</p>
        </div>
        <button 
          onClick={openAddModal}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center border-4 border-gray-100 dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(124,58,237,0.2)] active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      {(!goals || goals.length === 0) ? (
        <div className="text-center py-12 px-4 clay-card animate-in zoom-in-95 duration-500 delay-100">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-900 dark:text-white">
            <Target size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No goals yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-bold">Set a savings goal to stay motivated and track your progress.</p>
          <button 
            onClick={openAddModal}
            className="px-6 py-4 btn-primary w-full"
          >
            Add Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => {
            const percent = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isCompleted = percent >= 100;
            const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
            
            return (
              <div 
                key={goal.id} 
                className="clay-card p-5 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both relative group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <button 
                  onClick={() => openEditModal(goal)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors border-2 border-gray-200 dark:border-gray-700"
                >
                  <Edit2 size={14} strokeWidth={3} />
                </button>
                
                <div className="flex justify-between items-start mb-4 pr-10">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-4 shrink-0",
                      isCompleted 
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-500" 
                        : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    )}>
                      {isCompleted ? <Trophy size={20} strokeWidth={2.5} /> : <Target size={20} strokeWidth={2.5} />}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-gray-900 dark:text-white">{goal.name}</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        {currency}{goal.current_amount.toLocaleString()} / {currency}{goal.target_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 mb-2">
                  <div 
                    className={cn(
                      "h-full rounded-r-full transition-all duration-1000 ease-out",
                      isCompleted ? "bg-yellow-400" : "bg-primary"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs font-black">
                  <span className={isCompleted ? "text-yellow-600 dark:text-yellow-500" : "text-primary"}>
                    {percent.toFixed(0)}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {isCompleted ? 'Goal Reached!' : `${currency}${remaining.toLocaleString()} left`}
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
                {editingGoal ? 'Edit Goal' : 'New Goal'}
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
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Laptop"
                  className="w-full p-4 clay-input font-bold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Target Amount ({currency})</label>
                <input 
                  type="number" 
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full p-4 clay-input font-bold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Current Saved ({currency})</label>
                <input 
                  type="number" 
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-4 clay-input font-bold"
                />
              </div>

              <div className="pt-4 flex gap-3">
                {editingGoal && (
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
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
}
