import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { uploadFile } from '../lib/storage';
import { optimizeImage } from '../lib/imageUtils';
import type { Customer, Address } from '../types';

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

  const fetchCustomers = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const customersRef = collection(db, 'customers');
      const q = user.role === 'admin' ? query(customersRef) : query(customersRef, where('userId', '==', user.id));
      
      const querySnapshot = await getDocs(q);
      const loadedCustomers: Customer[] = [];
      querySnapshot.forEach((doc) => {
          loadedCustomers.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setCustomers(loadedCustomers);
    } catch (error) {
      // console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    const newCustomerRef = doc(collection(db, 'customers'));
    
    let avatarUrl = restData.avatarUrl;
    let photoURL = restData.photoURL;

    if (file) {
      const optimizedFile = await optimizeImage(file, 400, 400, 0.8);
      const path = `customers/${newCustomerRef.id}/${Date.now()}_${optimizedFile.name}`;
      const uploadedUrl = await uploadFile(optimizedFile, path);
      avatarUrl = uploadedUrl;
      photoURL = uploadedUrl;
    }

    const newCustomer: Customer = {
        ...restData,
        id: newCustomerRef.id,
        userId: user.id,
        avatarUrl,
        photoURL,
        status: 'Ativo',
        signupDate: new Date().toISOString()
    };

    await setDoc(newCustomerRef, newCustomer);
    return newCustomer;
  };

  const updateCustomer = async (updatedCustomer: Customer & { file?: File }): Promise<void> => {
    const { file, id, ...restData } = updatedCustomer;
    const customerRef = doc(db, 'customers', id);
    
    let avatarUrl = restData.avatarUrl;
    let photoURL = restData.photoURL;

    if (file) {
      const optimizedFile = await optimizeImage(file, 400, 400, 0.8);
      const path = `customers/${id}/${Date.now()}_${optimizedFile.name}`;
      const uploadedUrl = await uploadFile(optimizedFile, path);
      avatarUrl = uploadedUrl;
      photoURL = uploadedUrl;
    }

    await updateDoc(customerRef, { 
      ...restData,
      avatarUrl,
      photoURL
    });
  };

  const updateCurrentCustomer = async (userId: string, updates: Partial<Customer> & { file?: File }): Promise<void> => {
    const customer = customers.find(c => c.userId === userId);
    const { file, ...restUpdates } = updates;

    if (customer) {
        const customerRef = doc(db, 'customers', customer.id);
        let avatarUrl = restUpdates.avatarUrl;
        let photoURL = restUpdates.photoURL;

        if (file) {
          const optimizedFile = await optimizeImage(file, 400, 400, 0.8);
          const path = `customers/${customer.id}/${Date.now()}_${optimizedFile.name}`;
          const uploadedUrl = await uploadFile(optimizedFile, path);
          avatarUrl = uploadedUrl;
          photoURL = uploadedUrl;
        }

        await updateDoc(customerRef, {
          ...restUpdates,
          avatarUrl: avatarUrl || customer.avatarUrl,
          photoURL: photoURL || customer.photoURL
        });
    } else {
        // If customer profile doesn't exist yet, create it
        const newCustomerRef = doc(collection(db, 'customers'));
        let avatarUrl = restUpdates.avatarUrl;
        let photoURL = restUpdates.photoURL;

        if (file) {
          const path = `customers/${newCustomerRef.id}/${Date.now()}_${file.name}`;
          const uploadedUrl = await uploadFile(file, path);
          avatarUrl = uploadedUrl;
          photoURL = uploadedUrl;
        }

        const newCustomer: Customer = {
            id: newCustomerRef.id,
            userId: userId,
            fullName: restUpdates.fullName || '',
            email: restUpdates.email || '',
            phone: restUpdates.phone || '',
            cpf: restUpdates.cpf,
            dob: (restUpdates as any).birthDate || restUpdates.dob,
            address: restUpdates.address,
            photoURL: photoURL,
            avatarUrl: avatarUrl,
            status: 'Ativo',
            signupDate: new Date().toISOString(),
            ...restUpdates
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
