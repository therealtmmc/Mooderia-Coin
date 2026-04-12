import Dexie, { type EntityTable } from 'dexie';

export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  account: string;
  date: string; // ISO string
  note?: string;
  mood?: 'happy' | 'neutral' | 'sad';
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

export interface User {
  id: string;
  username: string;
  pin: string;
  profilePic?: string;
  isAppLockEnabled: boolean;
}

const db = new Dexie('MooderiaCoinDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  accounts: EntityTable<Account, 'id'>;
  budgets: EntityTable<Budget, 'id'>;
  goals: EntityTable<Goal, 'id'>;
  users: EntityTable<User, 'id'>;
};

db.version(2).stores({
  transactions: 'id, type, category, account, date, mood',
  accounts: 'id, name',
  budgets: 'id, category, month',
  goals: 'id, name',
  users: 'id, username'
});

export { db };
