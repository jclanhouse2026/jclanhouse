import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getLocalData, setLocalData } from '../lib/storage_helper';
import type { Customer } from '../types';

type CustomerData = Omit<Customer, 'id' | 'userId' | 'signupDate' | 'status'> & { file?: File };

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  customersForCurrentUser: Customer[];
  addCustomer: (customerData: CustomerData) => Promise<Customer>;
  updateCustomer: (updatedCustomer: Customer & { file?: File }) => Promise<void>;
  updateCurrentCustomer: (userId: string, updates: Partial<Customer> & { file?: File }) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    const data = getLocalData<Customer[]>('customers', []);
    setCustomers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const customersForCurrentUser = useMemo(() => {
      if (!user) return [];
      return customers.filter(c => c.userId === user.id);
  }, [customers, user]);

  const addCustomer = async (customerData: CustomerData): Promise<Customer> => {
    if (!user) throw new Error("User must be logged in to add a customer");

    const { file, ...restData } = customerData;
    
    // Convert file to data URL if present
    let avatarUrl = restData.avatarUrl;
    if (file) {
        avatarUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    }

    const newCustomer: Customer = {
        ...restData,
        id: Date.now().toString(),
        userId: user.id,
        avatarUrl,
        photoURL: avatarUrl,
        status: 'Ativo',
        signupDate: new Date().toISOString()
    };

    const updated = [...customers, newCustomer];
    setCustomers(updated);
    setLocalData('customers', updated);
    return newCustomer;
  };

  const updateCustomer = async (updatedCustomer: Customer & { file?: File }): Promise<void> => {
    const { file, id, ...restData } = updatedCustomer;
    
    let avatarUrl = restData.avatarUrl;
    if (file) {
        avatarUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    }

    const updated = customers.map(c => c.id === id ? { ...c, ...restData, avatarUrl, photoURL: avatarUrl } : c);
    setCustomers(updated);
    setLocalData('customers', updated);
  };

  const updateCurrentCustomer = async (userId: string, updates: Partial<Customer> & { file?: File }): Promise<void> => {
    const customer = customers.find(c => c.userId === userId);
    const { file, ...restUpdates } = updates;

    if (customer) {
        let avatarUrl = restUpdates.avatarUrl;
        if (file) {
            avatarUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        }

        const updated = customers.map(c => c.id === customer.id ? { 
            ...c, 
            ...restUpdates, 
            avatarUrl: avatarUrl || c.avatarUrl, 
            photoURL: avatarUrl || c.photoURL 
        } : c);
        setCustomers(updated);
        setLocalData('customers', updated);
    } else {
        const newCustomer: Customer = {
            id: Date.now().toString(),
            userId: userId,
            fullName: restUpdates.fullName || '',
            email: restUpdates.email || '',
            phone: restUpdates.phone || '',
            cpf: restUpdates.cpf,
            dob: (restUpdates as any).birthDate || restUpdates.dob,
            address: restUpdates.address,
            photoURL: restUpdates.photoURL,
            avatarUrl: restUpdates.avatarUrl,
            status: 'Ativo',
            signupDate: new Date().toISOString(),
            ...restUpdates
        };
        const updated = [...customers, newCustomer];
        setCustomers(updated);
        setLocalData('customers', updated);
    }
  };

  const deleteCustomer = async (customerId: string): Promise<void> => {
    const updated = customers.filter(c => c.id !== customerId);
    setCustomers(updated);
    setLocalData('customers', updated);
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
