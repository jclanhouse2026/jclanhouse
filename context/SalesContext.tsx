import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export type SaleStatus = 'orcamento' | 'em_aberto' | 'finalizado' | 'cancelado';

export type SaleItem = {
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    observation: string;
};

export type Sale = {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  total: number;
  dateTime: string; // Changed to string for Supabase compatibility
  items: SaleItem[];
  amountPaid?: number;
  paymentMethod?: string;
  status: SaleStatus;
};

interface SalesContextType {
  sales: Sale[];
  salesForCurrentUser: Sale[];
  addSale: (saleData: Omit<Sale, 'id' | 'userId' | 'dateTime'>) => Promise<Sale>;
  updateSale: (id: string, saleData: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = useCallback(async () => {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('dateTime', { ascending: false });
    
    if (data) {
        setSales(data as Sale[]);
    }
  }, []);

  useEffect(() => {
    fetchSales();

    const subscription = supabase
        .channel('sales-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, (payload) => {
            if (payload.eventType === 'INSERT') {
                setSales(prev => [payload.new as Sale, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setSales(prev => prev.map(s => s.id === payload.new.id ? payload.new as Sale : s));
            } else if (payload.eventType === 'DELETE') {
                setSales(prev => prev.filter(s => s.id !== payload.old.id));
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(subscription);
    };
  }, [fetchSales]);

  const salesForCurrentUser = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return sales;
    return sales.filter(s => s.userId === user.id);
  }, [sales, user]);

  const addSale = async (saleData: Omit<Sale, 'id' | 'userId' | 'dateTime'>): Promise<Sale> => {
    if (!user) throw new Error("Usuário não está logado para registrar venda.");
    
    const newSale = {
      ...saleData,
      userId: user.id,
      dateTime: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
        .from('sales')
        .insert([newSale])
        .select()
        .single();
    
    if (error) throw error;
    return data as Sale;
  };

  const updateSale = async (id: string, saleData: Partial<Sale>) => {
      const { error } = await supabase
          .from('sales')
          .update(saleData)
          .eq('id', id);
      
      if (error) throw error;
  };

  const deleteSale = async (id: string) => {
      const { error } = await supabase
          .from('sales')
          .delete()
          .eq('id', id);
      
      if (error) throw error;
  };

  return (
    <SalesContext.Provider value={{ sales, salesForCurrentUser, addSale, updateSale, deleteSale }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = (): SalesContextType => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
