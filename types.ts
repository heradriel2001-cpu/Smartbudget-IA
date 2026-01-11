
export type TransactionType = 'income' | 'expense' | 'transfer';
export type Currency = 'UYU' | 'USD';
export type DebtType = 'to_pay' | 'to_collect';

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: Currency;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  category: string;
  subCategory?: string;
  description: string;
  type: TransactionType;
  accountId: string;
  toAccountId?: string;
}

export interface Debt {
  id: string;
  contactName: string;
  amount: number;
  currency: Currency;
  type: DebtType;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid';
  linkedAccountId?: string; // Cuenta vinculada para el pago
}

export interface BudgetRecommendation {
  category: string;
  suggestedLimit: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIAnalysisResult {
  monthlyPrediction: number;
  topSavingsOpportunities: {
    title: string;
    description: string;
    estimatedSavings: number;
  }[];
  suggestedBudget: BudgetRecommendation[];
  financialHealthScore: number;
  summary: string;
  savingsGoalFeedback?: {
    isPossible: boolean;
    verdict: string;
    steps: string[];
  };
}

export enum AppTab {
  Dashboard = 'dashboard',
  Transactions = 'transactions',
  Accounts = 'accounts',
  Debts = 'debts',
  AIAdvisor = 'ai_advisor',
}
