import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { Theme, ThemeOrder } from '../types';
import { getLocalData, setLocalData } from '../lib/storage_helper';
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
  const { user } = useAuth();
  const { addNotification, sendNotificationToAll } = useNotifications();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeOrders, setThemeOrders] = useState<ThemeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = useCallback(() => {
    setLoading(true);
    const data = getLocalData<Theme[]>('themes', []);
    setThemes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchThemes();
    const orders = getLocalData<ThemeOrder[]>('theme_orders', []);
    setThemeOrders(orders);
  }, [fetchThemes]);

  const addTheme = async (themeData: Omit<Theme, 'id'> & { file?: File }) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar tema.");

    const { imageUrl, file, ...restThemeData } = themeData;
    let publicUrl = imageUrl;

    if (file) {
        publicUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    }

    const newTheme: Theme = { 
      ...restThemeData, 
      id: Date.now().toString(),
      imageUrl: publicUrl || '',
    };
    
    const updated = [...themes, newTheme];
    setThemes(updated);
    setLocalData('themes', updated);

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
        publicUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    }

    const updated = themes.map(t => t.id === id ? { ...t, ...restThemeData, imageUrl: publicUrl } : t);
    setThemes(updated);
    setLocalData('themes', updated);
  };

  const deleteTheme = async (themeId: string) => {
    const updated = themes.filter(t => t.id !== themeId);
    setThemes(updated);
    setLocalData('themes', updated);
  };

  const addThemeOrder = async (orderData: Omit<ThemeOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: ThemeOrder = {
      ...orderData,
      id: Date.now().toString(),
      userId: user ? user.id : null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const updated = [newOrder, ...themeOrders];
    setThemeOrders(updated);
    setLocalData('theme_orders', updated);

    if (user) {
      await addNotification(
        user.id,
        'Pedido de Personalização Recebido!',
        `Seu pedido de ${orderData.productType} com o tema "${orderData.themeName}" foi recebido.`,
        'success'
      );
    }

    return newOrder.id;
  };

  const updateThemeOrderStatus = async (orderId: string, status: 'pending' | 'completed') => {
    const order = themeOrders.find(o => o.id === orderId);
    if (order) {
        const updated = themeOrders.map(o => o.id === orderId ? { ...o, status } : o);
        setThemeOrders(updated);
        setLocalData('theme_orders', updated);
        
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
    const updated = themeOrders.filter(o => o.id !== orderId);
    setThemeOrders(updated);
    setLocalData('theme_orders', updated);
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
