import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { Theme, ThemeOrder } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface ThemeContextType {
  themes: Theme[];
  themeOrders: ThemeOrder[];
  loading: boolean;
  addTheme: (theme: Omit<Theme, 'id'> & { file?: File }) => Promise<void>;
  updateTheme: (theme: Theme & { file?: File }) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  addThemeOrder: (order: Omit<ThemeOrder, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateThemeOrderStatus: (orderId: string, status: 'pending' | 'completed') => Promise<void>;
  deleteThemeOrder: (orderId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, uploadFile } = useAuth();
  const { addNotification, sendNotificationToAll } = useNotifications();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeOrders, setThemeOrders] = useState<ThemeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Initial fetch
    const fetchInitialData = async () => {
        const { data: themesData } = await supabase
            .from('themes')
            .select('*')
            .order('name', { ascending: true });
        
        const { data: ordersData } = await supabase
            .from('theme_orders')
            .select('*')
            .order('createdAt', { ascending: false });
        
        setThemes(themesData || []);
        setThemeOrders(ordersData || []);
        setLoading(false);
    };

    fetchInitialData();

    // Subscriptions
    const themesSubscription = supabase
        .channel('themes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'themes' }, (payload) => {
            if (payload.eventType === 'INSERT') {
                setThemes(prev => [...prev, payload.new as Theme].sort((a, b) => a.name.localeCompare(b.name)));
            } else if (payload.eventType === 'UPDATE') {
                setThemes(prev => prev.map(t => t.id === payload.new.id ? payload.new as Theme : t));
            } else if (payload.eventType === 'DELETE') {
                setThemes(prev => prev.filter(t => t.id !== payload.old.id));
            }
        })
        .subscribe();

    const ordersSubscription = supabase
        .channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'theme_orders' }, (payload) => {
            if (payload.eventType === 'INSERT') {
                setThemeOrders(prev => [payload.new as ThemeOrder, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setThemeOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as ThemeOrder : o));
            } else if (payload.eventType === 'DELETE') {
                setThemeOrders(prev => prev.filter(o => o.id !== payload.old.id));
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(themesSubscription);
        supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const addTheme = async (themeData: Omit<Theme, 'id'> & { file?: File }) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar tema.");

    const { imageUrl, file, ...restThemeData } = themeData;
    let publicUrl = imageUrl;

    if (file) {
        const path = `themes/${Date.now()}_${file.name}`;
        publicUrl = await uploadFile(file, path);
    }

    const newTheme = { 
      ...restThemeData, 
      imageUrl: publicUrl || '',
      createdAt: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('themes')
        .insert([newTheme]);
    
    if (error) throw error;

    await sendNotificationToAll(
      'Novo Tema Adicionado!',
      `Um novo tema "${themeData.name}" foi adicionado à categoria ${themeData.category}. Confira agora!`,
      'info'
    );
  };

  const updateTheme = async (updatedTheme: Theme & { file?: File }) => {
    const { id, imageUrl, file, ...restThemeData } = updatedTheme;
    let publicUrl = imageUrl;

    if (file) {
        const path = `themes/${Date.now()}_${file.name}`;
        publicUrl = await uploadFile(file, path);
    }

    const updateData = { ...restThemeData, imageUrl: publicUrl };
    const { error } = await supabase
        .from('themes')
        .update(updateData)
        .eq('id', id);
    
    if (error) throw error;
  };

  const deleteTheme = async (themeId: string) => {
    const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);
    
    if (error) throw error;
  };

  const addThemeOrder = async (orderData: Omit<ThemeOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder = {
      ...orderData,
      userId: user ? user.id : null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const { data, error } = await supabase
        .from('theme_orders')
        .insert([newOrder])
        .select()
        .single();
    
    if (error) throw error;

    if (user) {
      await addNotification(
        user.id,
        'Pedido de Personalização Recebido!',
        `Seu pedido de ${orderData.productType} com o tema "${orderData.themeName}" foi recebido.`,
        'success'
      );
    }

    return data.id;
  };

  const updateThemeOrderStatus = async (orderId: string, status: 'pending' | 'completed') => {
    const order = themeOrders.find(o => o.id === orderId);
    if (order) {
        const { error } = await supabase
            .from('theme_orders')
            .update({ status })
            .eq('id', orderId);
        
        if (error) throw error;
        
        if (order.userId && status === 'completed') {
          await addNotification(
            order.userId,
            'Personalização Concluída!',
            `Seu pedido de ${order.productType} (${order.themeName}) está pronto!`,
            'success'
          );
        }
    }
  };

  const deleteThemeOrder = async (orderId: string) => {
    const { error } = await supabase
        .from('theme_orders')
        .delete()
        .eq('id', orderId);
    
    if (error) throw error;
  };

  return (
    <ThemeContext.Provider value={{ 
      themes, 
      themeOrders, 
      loading,
      addTheme, 
      updateTheme, 
      deleteTheme,
      addThemeOrder,
      updateThemeOrderStatus,
      deleteThemeOrder
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemes = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemes must be used within a ThemeProvider');
  }
  return context;
};
