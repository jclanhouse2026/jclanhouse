import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/storage';
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

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      
      // Map database fields to frontend types
      const mappedData = (data || []).map(c => ({
        id: c.id,
        userId: c.user_id,
        fullName: c.full_name,
        email: c.email,
        phone: c.phone,
        cpf: c.cpf,
        dob: c.dob,
        avatarUrl: c.avatar_url,
        photoURL: c.avatar_url,
        address: c.address,
        status: c.status,
        signupDate: c.signup_date
      }));
      
      setCustomers(mappedData as Customer[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();

    const subscription = supabase
      .channel('customers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        fetchCustomers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCustomers]);

  const customersForCurrentUser = useMemo(() => {
      if (!user) return [];
      if (user.role === 'admin') return customers;
      return customers.filter(c => c.userId === user.id);
  }, [customers, user]);

  const addCustomer = async (customerData: CustomerData): Promise<Customer> => {
    if (!user) throw new Error("User must be logged in to add a customer");

    const { file, ...restData } = customerData;
    
    let avatarUrl = restData.avatarUrl;
    if (file) {
        avatarUrl = await uploadFile(file, 'avatars');
    }

    const dbCustomer = {
        user_id: user.id,
        full_name: restData.fullName,
        email: restData.email,
        phone: restData.phone,
        cpf: restData.cpf,
        dob: restData.dob,
        avatar_url: avatarUrl,
        address: restData.address,
        status: 'Ativo'
    };

    const { data, error } = await supabase
        .from('customers')
        .insert([dbCustomer])
        .select()
        .single();
    
    if (error) throw error;

    const newCustomer: Customer = {
        ...restData,
        id: data.id,
        userId: data.user_id,
        avatarUrl: data.avatar_url,
        photoURL: data.avatar_url,
        status: data.status,
        signupDate: data.signup_date
    };

    return newCustomer;
  };

  const updateCustomer = async (updatedCustomer: Customer & { file?: File }): Promise<void> => {
    const { file, id, ...restData } = updatedCustomer;
    
    let avatarUrl = restData.avatarUrl;
    if (file) {
        avatarUrl = await uploadFile(file, 'avatars');
    }

    const { error } = await supabase
      .from('customers')
      .update({
        full_name: restData.fullName,
        email: restData.email,
        phone: restData.phone,
        cpf: restData.cpf,
        dob: restData.dob,
        avatar_url: avatarUrl,
        address: restData.address
      })
      .eq('id', id);
    
    if (error) throw error;
  };

  const updateCurrentCustomer = async (userId: string, updates: Partial<Customer> & { file?: File }): Promise<void> => {
    const customer = customers.find(c => c.userId === userId);
    const { file, ...restUpdates } = updates;

    let avatarUrl = restUpdates.avatarUrl;
    if (file) {
        avatarUrl = await uploadFile(file, 'avatars');
    }

    if (customer) {
        const { error } = await supabase
          .from('customers')
          .update({
            full_name: restUpdates.fullName || customer.fullName,
            email: restUpdates.email || customer.email,
            phone: restUpdates.phone || customer.phone,
            cpf: restUpdates.cpf || customer.cpf,
            dob: restUpdates.dob || customer.dob,
            avatar_url: avatarUrl || customer.avatarUrl,
            address: restUpdates.address || customer.address
          })
          .eq('id', customer.id);
        
        if (error) throw error;
    } else {
        const dbCustomer = {
            user_id: userId,
            full_name: restUpdates.fullName || '',
            email: restUpdates.email || '',
            phone: restUpdates.phone || '',
            cpf: restUpdates.cpf,
            dob: restUpdates.dob,
            avatar_url: avatarUrl,
            address: restUpdates.address || {},
            status: 'Ativo'
        };

        const { error } = await supabase
            .from('customers')
            .insert([dbCustomer]);
        
        if (error) throw error;
    }
  };

  const deleteCustomer = async (customerId: string): Promise<void> => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);
    
    if (error) throw error;
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
