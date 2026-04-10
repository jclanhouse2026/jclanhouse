import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getLocalData, setLocalData } from '../lib/storage_helper';

export type Expense = {
    id: string;
    userId: string;
    dateTime: Date;
    expenseType: string;
    description: string;
    observation: string;
    supplier: string;
    category: string;
    total: number;
    paymentMethod: string;
};

interface ExpensesContextType {
  expenses: Expense[];
  expensesForCurrentUser: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'dateTime'>) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchExpenses = useCallback(() => {
    const data = getLocalData<any[]>('expenses', []);
    const formattedData = data.map(item => ({
        ...item,
        dateTime: new Date(item.dateTime)
    }));
    setExpenses(formattedData);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const expensesForCurrentUser = useMemo(() => {
      if (!user) return [];
      if (user.role === 'admin') return expenses;
      return expenses.filter(e => e.userId === user.id);
  }, [expenses, user]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'dateTime'>) => {
    if (!user) throw new Error("Usuário não está logado para registrar despesa.");
    
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      userId: user.id,
      dateTime: new Date(),
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    setLocalData('expenses', updated);
  };

  return (
    <ExpensesContext.Provider value={{ expenses, expensesForCurrentUser, addExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = (): ExpensesContextType => {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpenses must be used within a ExpensesProvider');
  }
  return context;
};
