// Database Types
export type Household = {
  id: string;
  created_at: string;
  person1_name: string;
  person2_name: string;
};

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  household_id: string;
  type: TransactionType;
  amount: number; // 만원 단위
  category: string;
  date: string;
  memo?: string | null;
  person: string; // '남편' 또는 '아내'
  created_at: string;
};

export type BudgetItem = {
  id: string;
  household_id: string;
  type: TransactionType;
  title: string;
  amount: number; // 만원 단위
  is_recurring: boolean;
  is_checked: boolean;
  month: string; // 'YYYY-MM' 형식
  due_date?: number | null; // 마감일 (1-31)
  created_at: string;
};

export type Todo = {
  id: string;
  household_id: string;
  title: string;
  requester: string; // '남편' 또는 '아내'
  assignee: string; // '남편' 또는 '아내'
  due_date: string;
  is_completed: boolean;
  memo?: string | null;
  created_at: string;
  completed_at?: string | null;
};

export type MonthlyBalance = {
  id: string;
  household_id: string;
  month: string; // 'YYYY-MM' 형식
  opening_balance: number; // 이월 잔액 (만원 단위)
  closing_balance: number; // 마감 잔액 (만원 단위)
  created_at: string;
};

// Supabase Database Schema Type
export type Database = {
  public: {
    Tables: {
      household: {
        Row: Household;
        Insert: Omit<Household, 'id' | 'created_at'>;
        Update: Partial<Omit<Household, 'id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
      budget_items: {
        Row: BudgetItem;
        Insert: Omit<BudgetItem, 'id' | 'created_at'>;
        Update: Partial<Omit<BudgetItem, 'id' | 'created_at'>>;
      };
      todos: {
        Row: Todo;
        Insert: Omit<Todo, 'id' | 'created_at'>;
        Update: Partial<Omit<Todo, 'id' | 'created_at'>>;
      };
      monthly_balances: {
        Row: MonthlyBalance;
        Insert: Omit<MonthlyBalance, 'id' | 'created_at'>;
        Update: Partial<Omit<MonthlyBalance, 'id' | 'created_at'>>;
      };
    };
  };
};


