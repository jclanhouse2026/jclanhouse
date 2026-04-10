import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getLocalData, setLocalData } from '../lib/storage_helper';
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
    const fetchOrders = () => {
      setLoading(true);
      const data = getLocalData<Order[]>('orders', []);
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const createOrder = async (items: OrderItem[], address: Address, totalAmount: number, customerName: string, customerPhone: string): Promise<Order> => {
    if (!user) throw new Error("Você precisa estar logado para realizar um pedido.");

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: user.id,
      customerName,
      customerPhone,
      address,
      items,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    setLocalData('orders', updated);
    
    // Notify Client
    await addNotification(
      user.id,
      'Pedido Realizado!',
      `Seu pedido #${newOrder.id.slice(-6)} foi recebido com sucesso e está aguardando processamento.`,
      'success'
    );

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
        setOrders(updated);
        setLocalData('orders', updated);
        
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
  };

  const deleteOrder = async (orderId: string) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    setLocalData('orders', updated);
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
