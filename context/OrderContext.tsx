import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import type { Order, OrderItem, Address } from '../types';

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (items: OrderItem[], address: Address, totalAmount: number, customerName: string, customerPhone: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getUserOrders: (userId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        
        // Admin sees all orders, regular user only sees their own
        const q = user.role === 'admin'
          ? query(ordersRef, orderBy('createdAt', 'desc'))
          : query(ordersRef, where('userId', '==', user.id), orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const createOrder = async (items: OrderItem[], address: Address, totalAmount: number, customerName: string, customerPhone: string): Promise<Order> => {
    if (!user) throw new Error("Você precisa estar logado para realizar um pedido.");

    try {
      const newOrderData: Omit<Order, 'id'> = {
        userId: user.id,
        customerName,
        customerPhone,
        address,
        items,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'orders'), newOrderData);
      const newOrder = { id: docRef.id, ...newOrderData } as Order;
      
      // Notify Client
      await addNotification(
        user.id,
        'Pedido Realizado!',
        `Seu pedido #${docRef.id.slice(-6)} foi recebido com sucesso e está aguardando processamento.`,
        'success'
      );

      // Notify Admin
      const adminsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
      adminsSnapshot.docs.forEach(adminDoc => {
        addNotification(
          adminDoc.id,
          'Novo Pedido Recebido',
          `Um novo pedido (#${docRef.id.slice(-6)}) foi realizado por ${customerName}.`,
          'info'
        );
      });
      
      return newOrder;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const order = orders.find(o => o.id === orderId);
      await updateDoc(doc(db, 'orders', orderId), { status });
      
      if (order) {
        let title = 'Atualização do Pedido';
        let message = `O status do seu pedido #${orderId.slice(-6)} foi alterado para: ${status}.`;
        let type: 'info' | 'success' = 'info';

        switch (status) {
          case 'processing':
            message = `Seu pedido #${orderId.slice(-6)} está sendo processado.`;
            break;
          case 'shipped':
            message = `Seu pedido #${orderId.slice(-6)} foi enviado!`;
            type = 'success';
            break;
          case 'delivered':
            message = `Seu pedido #${orderId.slice(-6)} foi entregue.`;
            type = 'success';
            break;
          case 'completed':
            message = `Seu pedido #${orderId.slice(-6)} foi finalizado. Obrigado pela preferência!`;
            type = 'success';
            break;
          case 'cancelled':
            message = `Seu pedido #${orderId.slice(-6)} foi cancelado.`;
            break;
        }

        await addNotification(order.userId, title, message, type);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(o => o.userId === userId);
  };

  return (
    <OrderContext.Provider value={{ orders, loading, createOrder, updateOrderStatus, deleteOrder, getUserOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};
