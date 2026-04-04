import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';

type SaleItem = {
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    observation: string;
};
export type Sale = {
  id: string;
  userId: string; // ID of the user who made the sale
  customerName: string;
  phone: string;
  total: number;
  dateTime: Date;
  items: SaleItem[];
  amountPaid?: number;
  paymentMethod?: string;
};

interface SalesContextType {
  sales: Sale[]; // All sales for admin view
  salesForCurrentUser: Sale[]; // Filtered for logged-in user
  addSale: (saleData: Omit<Sale, 'id' | 'userId' | 'dateTime'>) => Promise<Sale>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
        if (!user) {
            setSales([]);
            return;
        }

        try {
            const q = query(collection(db, 'sales'), orderBy('date_time', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const formattedData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: data.user_id,
                    customerName: data.customer_name,
                    phone: data.phone,
                    total: data.total,
                    dateTime: new Date(data.date_time),
                    items: data.items,
                    amountPaid: data.amount_paid,
                    paymentMethod: data.payment_method,
                };
            });
            setSales(formattedData);
        } catch (e) {
            console.error("Exceção ao buscar histórico de vendas:", (e as Error).message);
            setSales([]);
        }
    };
    fetchSales();
  }, [user]);

  const salesForCurrentUser = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return sales;
    return sales.filter(s => s.userId === user.id);
  }, [sales, user]);

  const addSale = async (saleData: Omit<Sale, 'id' | 'userId' | 'dateTime'>): Promise<Sale> => {
    if (!user) throw new Error("Usuário não está logado para registrar venda.");
    
    const newSaleData = {
      user_id: user.id,
      customer_name: saleData.customerName,
      phone: saleData.phone,
      total: saleData.total,
      date_time: new Date().toISOString(),
      items: saleData.items,
      amount_paid: saleData.amountPaid,
      payment_method: saleData.paymentMethod
    };
    
    const docRef = await addDoc(collection(db, 'sales'), newSaleData);

    const newSale: Sale = {
      id: docRef.id,
      userId: newSaleData.user_id,
      customerName: newSaleData.customer_name,
      phone: newSaleData.phone,
      total: newSaleData.total,
      dateTime: new Date(newSaleData.date_time),
      items: newSaleData.items,
      amountPaid: newSaleData.amount_paid,
      paymentMethod: newSaleData.payment_method,
    };
    
    setSales(prevSales => [newSale, ...prevSales]);
    return newSale;
  };

  return (
    <SalesContext.Provider value={{ sales, salesForCurrentUser, addSale }}>
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
