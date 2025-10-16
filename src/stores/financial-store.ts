import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FinancialRecord {
  _id?: string;
  type: 'income' | 'expense';
  category: 'feed' | 'veterinary' | 'equipment' | 'labor' | 'sales' | 'other';
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  relatedAnimalId?: string;
  relatedAnimalTagId?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other';
  receiptNumber?: string;
  vendor?: string;
  tags?: string[];
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FinancialState {
  financialRecords: FinancialRecord[];
  selectedRecord: FinancialRecord | null;
  loading: boolean;
  error: string | null;

  // Actions
  setFinancialRecords: (records: FinancialRecord[]) => void;
  addFinancialRecord: (record: FinancialRecord) => void;
  updateFinancialRecord: (id: string, updates: Partial<FinancialRecord>) => void;
  deleteFinancialRecord: (id: string) => void;
  setSelectedRecord: (record: FinancialRecord | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed values
  getRecordsByCategory: (category: string) => FinancialRecord[];
  getRecordsByType: (type: string) => FinancialRecord[];
  getTotalIncome: (startDate?: Date, endDate?: Date) => number;
getTotalExpenses: (startDate?: Date, endDate?: Date) => number;
getNetProfit: (startDate?: Date, endDate?: Date) => number;
getMonthlyTrends: (months: number) => { month: string; income: number; expenses: number; profit: number }[];
getTopExpenses: (limit: number) => { category: string; amount: number }[];
getRecordsByAnimal: (animalId: string) => FinancialRecord[];
getFilteredRecords: (startDate?: Date, endDate?: Date) => FinancialRecord[];
}

export const useFinancialStore = create<FinancialState>()(
  devtools(
    (set, get) => ({
      financialRecords: [],
      selectedRecord: null,
      loading: false,
      error: null,

      setFinancialRecords: (records) => set({ financialRecords: records }),

      addFinancialRecord: (record) =>
        set((state) => ({
          financialRecords: [...state.financialRecords, record],
        })),

      updateFinancialRecord: (id, updates) =>
        set((state) => ({
          financialRecords: state.financialRecords.map((record) =>
            record._id === id ? { ...record, ...updates } : record
          ),
        })),

      deleteFinancialRecord: (id) =>
        set((state) => ({
          financialRecords: state.financialRecords.filter((record) => record._id !== id),
        })),

      setSelectedRecord: (record) => set({ selectedRecord: record }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      getRecordsByCategory: (category) => {
        return get().financialRecords.filter((record) => record.category === category);
      },

      getRecordsByType: (type) => {
        return get().financialRecords.filter((record) => record.type === type);
      },

      getTotalIncome: (startDate?: Date, endDate?: Date) => {
        const records = get().getFilteredRecords(startDate, endDate);
        return records
          .filter((record: FinancialRecord) => record.type === 'income')
          .reduce((total: number, record: FinancialRecord) => total + record.amount, 0);
      },

      getTotalExpenses: (startDate?: Date, endDate?: Date) => {
        const records = get().getFilteredRecords(startDate, endDate);
        return records
          .filter((record: FinancialRecord) => record.type === 'expense')
          .reduce((total: number, record: FinancialRecord) => total + record.amount, 0);
      },

      getNetProfit: (startDate, endDate) => {
        return get().getTotalIncome(startDate, endDate) - get().getTotalExpenses(startDate, endDate);
      },

      getMonthlyTrends: (months) => {
        const trends = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const income = get().getTotalIncome(monthStart, monthEnd);
          const expenses = get().getTotalExpenses(monthStart, monthEnd);
          const profit = income - expenses;

          trends.push({ month: monthName, income, expenses, profit });
        }

        return trends;
      },

      getTopExpenses: (limit) => {
        const expenses = get().financialRecords.filter((record) => record.type === 'expense');
        const categoryTotals = expenses.reduce((acc, record) => {
          acc[record.category] = (acc[record.category] || 0) + record.amount;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryTotals)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, limit);
      },

      getRecordsByAnimal: (animalId) => {
        return get().financialRecords.filter((record) => record.relatedAnimalId === animalId);
      },

      // Helper method for filtering records by date range
      getFilteredRecords: (startDate?: Date, endDate?: Date) => {
        let records = get().financialRecords;

        if (startDate) {
          records = records.filter((record: FinancialRecord) => record.date >= startDate);
        }

        if (endDate) {
          records = records.filter((record: FinancialRecord) => record.date <= endDate);
        }

        return records;
      },
    }),
    {
      name: 'financial-store',
    }
  )
);