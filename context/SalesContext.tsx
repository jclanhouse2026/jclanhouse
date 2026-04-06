import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

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

  useEffect(() => {
    if (!user) {
        setSales([]);
        return;
    }

    const q = query(collection(db, 'sales'), orderBy('date_time', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
                status: data.status || 'finalizado', // Default para antigas
            };
        });
        setSales(formattedData);
    }, (error) => {
        console.error("Exceção ao buscar histórico de vendas:", error.message);
        setSales([]);
    });

    return () => unsubscribe();
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
      payment_method: saleData.paymentMethod,
      status: saleData.status
    };
    
    const docRef = await addDoc(collection(db, 'sales'), newSaleData);

    return {
      id: docRef.id,
      userId: newSaleData.user_id,
      customerName: newSaleData.customer_name,
      phone: newSaleData.phone,
      total: newSaleData.total,
      dateTime: new Date(newSaleData.date_time),
      items: newSaleData.items,
      amountPaid: newSaleData.amount_paid,
      paymentMethod: newSaleData.payment_method,
      status: newSaleData.status as SaleStatus
    };
  };

  const updateSale = async (id: string, saleData: Partial<Sale>) => {
      const updateData: any = {};
      if (saleData.customerName !== undefined) updateData.customer_name = saleData.customerName;
      if (saleData.phone !== undefined) updateData.phone = saleData.phone;
      if (saleData.total !== undefined) updateData.total = saleData.total;
      if (saleData.items !== undefined) updateData.items = saleData.items;
      if (saleData.amountPaid !== undefined) updateData.amount_paid = saleData.amountPaid;
      if (saleData.paymentMethod !== undefined) updateData.payment_method = saleData.paymentMethod;
      if (saleData.status !== undefined) updateData.status = saleData.status;

      await updateDoc(doc(db, 'sales', id), updateData);
  };

  const deleteSale = async (id: string) => {
      await deleteDoc(doc(db, 'sales', id));
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
