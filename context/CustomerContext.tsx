import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
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
    
    const customersRef = collection(db, 'customers');
    const q = user.role === 'admin' ? query(customersRef) : query(customersRef, where('userId', '==', user.id));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loadedCustomers: Customer[] = [];
        querySnapshot.forEach((doc) => {
            loadedCustomers.push({ id: doc.id, ...doc.data() } as Customer);
        });
        setCustomers(loadedCustomers);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching customers:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const customersForCurrentUser = useMemo(() => {
      if (!user) return [];
      return customers.filter(c => c.userId === user.id);
  }, [customers, user]);

  const addCustomer = async (customerData: CustomerData): Promise<Customer> => {
    if (!user) throw new Error("User must be logged in to add a customer");

    const newCustomerRef = doc(collection(db, 'customers'));
    const newCustomer: Customer = {
        ...customerData,
        id: newCustomerRef.id,
        userId: user.id,
        status: 'Ativo',
        signupDate: new Date().toISOString()
    };

    await setDoc(newCustomerRef, newCustomer);
    return newCustomer;
  };

  const updateCustomer = async (updatedCustomer: Customer): Promise<void> => {
    const customerRef = doc(db, 'customers', updatedCustomer.id);
    await updateDoc(customerRef, { ...updatedCustomer });
  };

  const updateCurrentCustomer = async (userId: string, updates: Partial<Customer>): Promise<void> => {
    const customer = customers.find(c => c.userId === userId);
    if (customer) {
        const customerRef = doc(db, 'customers', customer.id);
        await updateDoc(customerRef, updates);
    } else {
        // If customer profile doesn't exist yet, create it
        const newCustomerRef = doc(collection(db, 'customers'));
        const newCustomer: Customer = {
            id: newCustomerRef.id,
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
        await setDoc(newCustomerRef, newCustomer);
    }
  };

  const deleteCustomer = async (customerId: string): Promise<void> => {
    await deleteDoc(doc(db, 'customers', customerId));
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
