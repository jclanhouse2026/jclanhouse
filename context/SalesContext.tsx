import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getLocalData, setLocalData } from '../lib/storage_helper';

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
  dateTime: Date;
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

  const fetchSales = useCallback(() => {
    const data = getLocalData<any[]>('sales', []);
    const formattedData = data.map(item => ({
        ...item,
        dateTime: new Date(item.dateTime)
    }));
    setSales(formattedData);
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const salesForCurrentUser = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return sales;
    return sales.filter(s => s.userId === user.id);
  }, [sales, user]);

  const addSale = async (saleData: Omit<Sale, 'id' | 'userId' | 'dateTime'>): Promise<Sale> => {
    if (!user) throw new Error("Usuário não está logado para registrar venda.");
    
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      userId: user.id,
      dateTime: new Date(),
    };
    
    const updated = [newSale, ...sales];
    setSales(updated);
    setLocalData('sales', updated);
    return newSale;
  };

  const updateSale = async (id: string, saleData: Partial<Sale>) => {
      const updated = sales.map(s => s.id === id ? { ...s, ...saleData } : s);
      setSales(updated);
      setLocalData('sales', updated);
  };

  const deleteSale = async (id: string) => {
      const updated = sales.filter(s => s.id !== id);
      setSales(updated);
      setLocalData('sales', updated);
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
