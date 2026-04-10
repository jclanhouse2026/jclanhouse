import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { Theme, ThemeOrder } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { uploadFile } from '../lib/storage';

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

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'themes'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Theme));
      setThemes(data);
    } catch (error) {
      // console.error("Erro ao buscar temas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
    
    const fetchThemeOrders = async () => {
      if (!user) {
        setThemeOrders([]);
        return;
      }
      
      try {
        const ordersQuery = user.role === 'admin' 
          ? query(collection(db, 'theme_orders'), orderBy('createdAt', 'desc'))
          : query(collection(db, 'theme_orders'), where('userId', '==', user.id), orderBy('createdAt', 'desc'));
          
        const snapshot = await getDocs(ordersQuery);
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ThemeOrder));
        setThemeOrders(orders);
      } catch (error) {
        console.error("Erro ao buscar pedidos de temas:", error);
      }
    };

    fetchThemeOrders();
  }, [user, fetchThemes]);

  const addTheme = async (themeData: Omit<Theme, 'id'> & { file?: File }) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar tema.");

    const { imageUrl, file, ...restThemeData } = themeData;
    let publicUrl = imageUrl;

    if (file) {
      const path = `themes/${Date.now()}_${file.name}`;
      publicUrl = await uploadFile(file, path);
    }

    const newThemeData: any = { 
      ...restThemeData, 
      imageUrl: publicUrl, 
      user_id: user.id,
      created_at: new Date().toISOString()
    };
    
    Object.keys(newThemeData).forEach(key => {
      if (newThemeData[key] === undefined) {
        delete newThemeData[key];
      }
    });

    const docRef = await addDoc(collection(db, 'themes'), newThemeData);

    // Notify all users about new theme
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
      const path = `themes/${id}/${Date.now()}_${file.name}`;
      publicUrl = await uploadFile(file, path);
    }

    const updateData: any = { 
      ...restThemeData, 
      imageUrl: publicUrl,
      updated_at: new Date().toISOString()
    };
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(doc(db, 'themes', id), updateData);
  };

  const deleteTheme = async (themeId: string) => {
    await deleteDoc(doc(db, 'themes', themeId));
  };

  const addThemeOrder = async (orderData: Omit<ThemeOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder = {
      ...orderData,
      userId: user ? user.id : null, // Save userId if logged in
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'theme_orders'), newOrder);

    // Notify Client
    if (user) {
      await addNotification(
        user.id,
        'Pedido de Personalização Recebido!',
        `Seu pedido de ${orderData.productType} com o tema "${orderData.themeName}" foi recebido.`,
        'success'
      );
    }

    // Notify Admin
    const adminsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
    adminsSnapshot.docs.forEach(adminDoc => {
      addNotification(
        adminDoc.id,
        'Novo Pedido de Personalização',
        `${orderData.customerName} solicitou um(a) ${orderData.productType} (${orderData.themeName}).`,
        'info'
      );
    });

    return docRef.id;
  };

  const updateThemeOrderStatus = async (orderId: string, status: 'pending' | 'completed') => {
    try {
      const order = themeOrders.find(o => o.id === orderId);
      await updateDoc(doc(db, 'theme_orders', orderId), { status });
      
      if (order && order.userId) {
        if (status === 'completed') {
          await addNotification(
            order.userId,
            'Personalização Concluída!',
            `Seu pedido de ${order.productType} (${order.themeName}) está pronto!`,
            'success'
          );
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar status do pedido de tema:", error);
    }
  };

  const deleteThemeOrder = async (orderId: string) => {
    await deleteDoc(doc(db, 'theme_orders', orderId));
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
