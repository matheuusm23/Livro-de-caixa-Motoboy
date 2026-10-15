export type TransactionType = 'income' | 'expense';
export type PeriodScope = 'daily' | 'weekly' | 'monthly';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amountInCents: number; // Armazenado em centavos para evitar erros de ponto flutuante
  date: string; // Formato YYYY-MM-DD
  time: string; // Formato HH:mm
  categoryId: string;
  accountId?: string;
  notes?: string;
  periodScope?: PeriodScope; // 'daily' | 'weekly' | 'monthly'
  recurrenceType?: 'single' | 'installment' | 'fixed';
  installmentNumber?: number;
  totalInstallments?: number;
  parentId?: string;
  isFixed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export type AccountType = 'cash' | 'checking' | 'savings' | 'credit' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalanceInCents: number;
  color: string;
  icon?: string;
}

export type PeriodFilter = 'all' | 'daily' | 'weekly' | 'monthly';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  backupNoticeDismissed: boolean;
  currency: string;
  lastBackupDate?: string;
}

export interface FinancialSummaryData {
  previousBalanceInCents: number;
  periodIncomeInCents: number;
  periodExpenseInCents: number;
  periodNetInCents: number; // periodIncome - periodExpense
  finalBalanceInCents: number; // previousBalance + periodNet
}
