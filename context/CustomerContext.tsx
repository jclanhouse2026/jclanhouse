import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import type { Customer, Address } from '../types';

type CustomerData = Omit<Customer, 'id' | 'userId' | 'signupDate' | 'status'>;

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  customersForCurrentUser: Customer[];
  addCustomer: (customerData: CustomerData) => Promise<Customer>;
  updateCustomer: (updatedCustomer: Customer) => Promise<void>;
  updateCurrentCustomer: (userId: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Helper for local storage customers
const getLocalCustomers = (): Customer[] => {
    try {
        const data = localStorage.getItem('app_customers');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveLocalCustomers = (customers: Customer[]) => {
    localStorage.setItem('app_customers', JSON.stringify(customers));
};

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const allCustomers = getLocalCustomers();
    
    if (user.role === 'admin') {
        setCustomers(allCustomers);
    } else {
        setCustomers(allCustomers.filter(c => c.userId === user.id));
    }
    
    setLoading(false);
  }, [user]);

  const customersForCurrentUser = useMemo(() => {
      if (!user) return [];
      return customers.filter(c => c.userId === user.id);
  }, [customers, user]);

  const addCustomer = async (customerData: CustomerData): Promise<Customer> => {
    if (!user) throw new Error("User must be logged in to add a customer");

    const newCustomer: Customer = {
        ...customerData,
        id: Date.now().toString(),
        userId: user.id,
        status: 'Ativo',
        signupDate: new Date().toISOString()
    };

    const allCustomers = getLocalCustomers();
    allCustomers.push(newCustomer);
    saveLocalCustomers(allCustomers);
    
    if (user.role === 'admin') {
        setCustomers(allCustomers);
    } else {
        setCustomers(allCustomers.filter(c => c.userId === user.id));
    }

    return newCustomer;
  };

  const updateCustomer = async (updatedCustomer: Customer): Promise<void> => {
    const allCustomers = getLocalCustomers();
    const index = allCustomers.findIndex(c => c.id === updatedCustomer.id);
    
    if (index !== -1) {
        allCustomers[index] = updatedCustomer;
        saveLocalCustomers(allCustomers);
        
        if (user?.role === 'admin') {
            setCustomers(allCustomers);
        } else if (user) {
            setCustomers(allCustomers.filter(c => c.userId === user.id));
        }
    }
  };

  const updateCurrentCustomer = async (userId: string, updates: Partial<Customer>): Promise<void> => {
    const allCustomers = getLocalCustomers();
    const index = allCustomers.findIndex(c => c.userId === userId);
    
    if (index !== -1) {
        allCustomers[index] = { ...allCustomers[index], ...updates };
        saveLocalCustomers(allCustomers);
        
        if (user?.role === 'admin') {
            setCustomers(allCustomers);
        } else if (user) {
            setCustomers(allCustomers.filter(c => c.userId === user.id));
        }
    } else {
        // If customer profile doesn't exist yet, create it
        const newCustomer: Customer = {
            id: Date.now().toString(),
            userId: userId,
            fullName: updates.fullName || '',
            email: updates.email || '',
            phone: updates.phone || '',
            cpf: updates.cpf,
            dob: (updates as any).birthDate || updates.dob,
            address: updates.address,
            photoURL: updates.photoURL,
            avatarUrl: updates.avatarUrl,
            status: 'Ativo',
            signupDate: new Date().toISOString(),
            ...updates
        };
        allCustomers.push(newCustomer);
        saveLocalCustomers(allCustomers);
        
        if (user?.role === 'admin') {
            setCustomers(allCustomers);
        } else if (user) {
            setCustomers(allCustomers.filter(c => c.userId === user.id));
        }
    }
  };

  const deleteCustomer = async (customerId: string): Promise<void> => {
    let allCustomers = getLocalCustomers();
    allCustomers = allCustomers.filter(c => c.id !== customerId);
    saveLocalCustomers(allCustomers);
    
    if (user?.role === 'admin') {
        setCustomers(allCustomers);
    } else if (user) {
        setCustomers(allCustomers.filter(c => c.userId === user.id));
    }
  };

  return (
    <CustomerContext.Provider value={{ 
        customers, 
        loading, 
        customersForCurrentUser,
        addCustomer, 
        updateCustomer, 
        updateCurrentCustomer,
        deleteCustomer 
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
