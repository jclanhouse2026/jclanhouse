import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, setDoc } from 'firebase/firestore';
import type { Customer, Address } from '../types';

// Detecta se o ambiente é o Google AI Studio para usar dados de fallback
const isGoogleStudio = !!((window as any).google && (window as any).google.colab);

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

// Dados de fallback para o ambiente de demonstração
const fallbackCustomers: Customer[] = [
    {
        id: '1',
        userId: '00000000-0000-0000-0000-000000000001',
        fullName: 'Cliente de Exemplo',
        email: 'cliente@example.com',
        phone: '(99) 99999-9999',
        status: 'Ativo',
        signupDate: new Date().toISOString(),
        address: {
            cep: '12345-000',
            street: 'Rua dos Exemplos',
            number: '123',
            neighborhood: 'Centro',
            city: 'Demo Cidade',
            state: 'DS',
        }
    },
    {
        id: '2',
        userId: '00000000-0000-0000-0000-000000000002',
        fullName: 'Visitante Padrão',
        email: 'visitante@example.com',
        phone: '(88) 88888-8888',
        status: 'Ativo',
        signupDate: new Date().toISOString(),
         address: {
            cep: '54321-000',
            street: 'Avenida dos Testes',
            number: '456',
            neighborhood: 'Bairro Modelo',
            city: 'Demo Cidade',
            state: 'DS',
        }
    }
];


export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      // Se for o ambiente de demonstração, usa os dados de fallback
      if (isGoogleStudio) {
          console.log("Ambiente Google AI Studio detectado, usando dados de fallback para Customers.");
          setCustomers(fallbackCustomers);
          setLoading(false);
          return;
      }

      if (!user) {
        setCustomers([]);
        setLoading(false);
        return;
      }
      try {
          const querySnapshot = await getDocs(collection(db, 'customers'));
          const data = querySnapshot.docs.map(doc => {
              const customerData = doc.data();
              return {
                  id: doc.id,
                  userId: customerData.user_id,
                  fullName: customerData.full_name,
                  cpf: customerData.cpf,
                  email: customerData.email,
                  phone: customerData.phone,
                  address: customerData.address,
                  dob: customerData.dob,
                  avatarUrl: customerData.avatar_url,
                  status: customerData.status,
                  signupDate: customerData.signup_date,
              } as Customer;
          });
          setCustomers(data);
      } catch (e) {
          console.error("Exceção ao buscar clientes:", (e as Error).message);
          setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [user]);

  // Mantido para compatibilidade, mas `customers` já deve ser filtrado por RLS.
  const customersForCurrentUser = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return customers;
    return customers.filter(c => c.userId === user.id);
  }, [customers, user]);


  const addCustomer = async (customerData: CustomerData): Promise<Customer> => {
    // Adiciona o cliente ao estado local no ambiente de demonstração
    if (isGoogleStudio) {
        const newCustomer: Customer = {
            id: Math.random().toString(),
            userId: 'demo-user',
            signupDate: new Date().toISOString(),
            status: 'Ativo',
            ...customerData
        };
        setCustomers(prev => [newCustomer, ...prev]);
        return Promise.resolve(newCustomer);
    }
      
    if (!user) throw new Error("Usuário não está logado para adicionar cliente.");
    
    const newCustomerData = {
      full_name: customerData.fullName,
      cpf: customerData.cpf,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      dob: customerData.dob,
      avatar_url: customerData.avatarUrl,
      user_id: user.id,
      signup_date: new Date().toISOString(),
      status: 'Ativo',
    };

    const docRef = await addDoc(collection(db, 'customers'), newCustomerData);
    
    const newCustomer: Customer = {
        id: docRef.id,
        userId: newCustomerData.user_id,
        fullName: newCustomerData.full_name,
        cpf: newCustomerData.cpf,
        email: newCustomerData.email,
        phone: newCustomerData.phone,
        address: newCustomerData.address,
        dob: newCustomerData.dob,
        avatarUrl: newCustomerData.avatar_url,
        status: newCustomerData.status as any,
        signupDate: newCustomerData.signup_date,
    };
    
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    if (isGoogleStudio) {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        return Promise.resolve();
    }
    
    const dbUpdateData = {
        full_name: updatedCustomer.fullName,
        cpf: updatedCustomer.cpf,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        dob: updatedCustomer.dob,
        avatar_url: updatedCustomer.avatarUrl,
        status: updatedCustomer.status,
    };

    await updateDoc(doc(db, 'customers', updatedCustomer.id), dbUpdateData);
    
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };
  
  const updateCurrentCustomer = async (userId: string, updates: Partial<Customer>) => {
    const dbUpdates: { [key: string]: any } = {
      user_id: userId,
    };
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.address !== undefined) dbUpdates.address = updates.address;

    const customerExists = customers.some(c => c.userId === userId);
    if (!customerExists) {
      dbUpdates.signup_date = new Date().toISOString();
      dbUpdates.status = 'Ativo';
    }

    // Upsert logic in Firestore
    const q = query(collection(db, 'customers'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    let docId = '';
    let finalData = { ...dbUpdates };
    
    if (!querySnapshot.empty) {
        docId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, 'customers', docId), dbUpdates);
        finalData = { ...querySnapshot.docs[0].data(), ...dbUpdates };
    } else {
        const docRef = await addDoc(collection(db, 'customers'), dbUpdates);
        docId = docRef.id;
    }

    const updatedCustomer: Customer = {
        id: docId,
        userId: finalData.user_id,
        fullName: finalData.full_name,
        cpf: finalData.cpf,
        email: finalData.email,
        phone: finalData.phone,
        address: finalData.address,
        dob: finalData.dob,
        avatarUrl: finalData.avatar_url,
        status: finalData.status,
        signupDate: finalData.signup_date,
    };

    setCustomers(prev => {
        const existingIndex = prev.findIndex(c => c.id === updatedCustomer.id);
        if (existingIndex > -1) {
            const newCustomers = [...prev];
            newCustomers[existingIndex] = updatedCustomer;
            return newCustomers;
        } else {
            return [...prev, updatedCustomer];
        }
    });
  };

  const deleteCustomer = async (customerId: string) => {
    if (isGoogleStudio) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        return Promise.resolve();
    }
    await deleteDoc(doc(db, 'customers', customerId));
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  return (
    <CustomerContext.Provider value={{ customers, loading, customersForCurrentUser, addCustomer, updateCustomer, updateCurrentCustomer, deleteCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
