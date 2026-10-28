export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  allocated: number; // monthly budget cap in dollars
  iconName: string;
  colorHint?: string;
  isFixed?: boolean;
}

export interface SplitParty {
  name: string;
  share: number;
  isPaid: boolean;
  avatarInitials: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  merchant: string;
  amount: number; // positive dollar amount
  type: TransactionType;
  categoryId: string;
  account: 'checking' | 'cash' | 'credit' | 'savings';
  note?: string;
  split?: {
    totalPaid: number;
    myShare: number;
    roommates: SplitParty[];
    isSettled: boolean;
  };
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  category: string;
  isAutoPay: boolean;
  frequency: 'monthly' | 'annual' | 'semester';
  studentDiscount?: boolean;
  lastBilled?: string;
}

export interface RoommateSplitBalance {
  id: string;
  name: string;
  avatarInitials: string;
  balance: number; // positive = they owe user, negative = user owes them
  lastActivity: string;
  pendingItems: string[];
}

export interface WorkspaceConfig {
  id: string;
  name: string;
  semester: string;
  monthlyIncomeTarget: number;
  monthlyBudgetCap: number;
  savingsTarget: number;
  currencySymbol: string;
}
