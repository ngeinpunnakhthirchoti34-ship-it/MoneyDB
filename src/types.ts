export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role?: 'admin' | 'teacher' | 'student' | 'user';
  provider?: 'google' | 'college' | 'custom';
}

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgLight: string;
}

export interface MonthlyStats {
  yearMonth: string; // "YYYY-MM"
  year: number;
  month: number; // 1-12
  monthNameThai: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // percentage
  incomeCount: number;
  expenseCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface DailyFlow {
  day: number;
  dateStr: string; // "YYYY-MM-DD"
  income: number;
  expense: number;
  balance: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
