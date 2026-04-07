import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, onSnapshot } from '../lib/localDb';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

export type Expense = {
    id: string;
    userId: string; // ID of the user who registered the expense
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
  expenses: Expense[]; // All expenses for admin view
  expensesForCurrentUser: Expense[]; // Filtered for logged-in user
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'dateTime'>) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (!user) {
        setExpenses([]);
        return;
    }
    
    const expensesRef = collection(db, 'expenses');
    const q = user.role === 'admin'
        ? query(expensesRef, orderBy('date_time', 'desc'))
        : query(expensesRef, where('user_id', '==', user.id), orderBy('date_time', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const formattedData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.user_id,
                dateTime: new Date(data.date_time),
                expenseType: data.expense_type,
                description: data.description,
                observation: data.observation,
                supplier: data.supplier,
                category: data.category,
                total: data.total,
                paymentMethod: data.payment_method,
            };
        });
        setExpenses(formattedData);
    }, (error) => {
        try {
            handleFirestoreError(error, OperationType.LIST, 'expenses');
        } catch (e) {
            console.error("Erro ao buscar despesas:", (e as Error).message);
            setExpenses([]);
        }
    });

    return () => unsubscribe();
  }, [user]);

  const expensesForCurrentUser = useMemo(() => {
      if (!user) return [];
      if (user.role === 'admin') return expenses;
      return expenses.filter(e => e.userId === user.id);
  }, [expenses, user]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'dateTime'>) => {
    if (!user) throw new Error("Usuário não está logado para registrar despesa.");
    
    const newExpenseData = {
      user_id: user.id,
      date_time: new Date().toISOString(),
      expense_type: expenseData.expenseType,
      description: expenseData.description,
      observation: expenseData.observation,
      supplier: expenseData.supplier,
      category: expenseData.category,
      total: expenseData.total,
      payment_method: expenseData.paymentMethod,
    };

    try {
        const docRef = await addDoc(collection(db, 'expenses'), newExpenseData);

        const newExpense: Expense = {
            id: docRef.id,
            userId: newExpenseData.user_id,
            dateTime: new Date(newExpenseData.date_time),
            expenseType: newExpenseData.expense_type,
            description: newExpenseData.description,
            observation: newExpenseData.observation,
            supplier: newExpenseData.supplier,
            category: newExpenseData.category,
            total: newExpenseData.total,
            paymentMethod: newExpenseData.payment_method,
        };
        // setExpenses(prevExpenses => [newExpense, ...prevExpenses]); // onSnapshot cuidará disso
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
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
