import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase } from '../lib/supabase';
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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedData = (data || []).map(o => ({
        id: o.id,
        userId: o.user_id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        address: o.address,
        items: o.items,
        totalAmount: Number(o.total_amount),
        status: o.status,
        createdAt: o.created_at
      }));
      
      setOrders(mappedData as Order[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  const createOrder = async (items: OrderItem[], address: Address, totalAmount: number, customerName: string, customerPhone: string): Promise<Order> => {
    if (!user) throw new Error("Você precisa estar logado para realizar um pedido.");

    const dbOrder = {
      user_id: user.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      address,
      items,
      total_amount: totalAmount,
      status: 'pending'
    };

    const { data, error } = await supabase
        .from('orders')
        .insert([dbOrder])
        .select()
        .single();
    
    if (error) throw error;

    const newOrder: Order = {
      id: data.id,
      userId: data.user_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      address: data.address,
      items: data.items,
      totalAmount: Number(data.total_amount),
      status: data.status,
      createdAt: data.created_at
    };
    
    // Notify Client
    await addNotification(
      user.id,
      'Pedido Realizado!',
      `Seu pedido #${newOrder.id.slice(0, 8)} foi recebido com sucesso e está aguardando processamento.`,
      'success'
    );

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);
        
        if (error) throw error;
        
        let title = 'Atualização do Pedido';
        let message = `O status do seu pedido #${orderId.slice(0, 8)} foi alterado para: ${status}.`;
        let type: 'info' | 'success' = 'info';

        switch (status) {
          case 'processing':
            message = `Seu pedido #${orderId.slice(0, 8)} está sendo processado.`;
            break;
          case 'shipped':
            message = `Seu pedido #${orderId.slice(0, 8)} foi enviado!`;
            type = 'success';
            break;
          case 'delivered':
            message = `Seu pedido #${orderId.slice(0, 8)} foi entregue.`;
            type = 'success';
            break;
          case 'completed':
            message = `Seu pedido #${orderId.slice(0, 8)} foi finalizado. Obrigado pela preferência!`;
            type = 'success';
            break;
          case 'cancelled':
            message = `Seu pedido #${orderId.slice(0, 8)} foi cancelado.`;
            break;
        }

        await addNotification(order.userId, title, message, type);
    }
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) throw error;
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
