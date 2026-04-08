import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Theme, MugOrder } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const THEME_BUCKET = 'themes';

interface ThemeContextType {
  themes: Theme[];
  mugOrders: MugOrder[];
  addTheme: (theme: Omit<Theme, 'id'>) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  addMugOrder: (order: Omit<MugOrder, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateMugOrderStatus: (orderId: string, status: 'pending' | 'completed') => Promise<void>;
  deleteMugOrder: (orderId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [mugOrders, setMugOrders] = useState<MugOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Listen for themes
    const themesUnsubscribe = onSnapshot(
      collection(db, 'themes'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Theme));
        setThemes(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar temas:", error);
        setLoading(false);
      }
    );

    // Listen for mug orders
    let ordersUnsubscribe = () => {};
    if (user) {
      const ordersQuery = user.role === 'admin' 
        ? query(collection(db, 'mug_orders'), orderBy('createdAt', 'desc'))
        : query(collection(db, 'mug_orders'), where('userId', '==', user.id), orderBy('createdAt', 'desc'));
        
      ordersUnsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as MugOrder));
          setMugOrders(orders);
        },
        (error) => {
          console.error("Erro ao buscar pedidos de canecas:", error);
        }
      );
    } else {
      setMugOrders([]);
    }

    return () => {
      themesUnsubscribe();
      ordersUnsubscribe();
    };
  }, [user]);

  const addTheme = async (themeData: Omit<Theme, 'id'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar tema.");

    const { imageUrl, ...restThemeData } = themeData;
    let publicUrl = imageUrl;

    const newThemeData: any = { ...restThemeData, imageUrl: publicUrl, user_id: user.id };
    
    Object.keys(newThemeData).forEach(key => {
      if (newThemeData[key] === undefined) {
        delete newThemeData[key];
      }
    });

    const docRef = await addDoc(collection(db, 'themes'), newThemeData);
    
    const newTheme: Theme = {
        id: docRef.id,
        name: newThemeData.name,
        category: newThemeData.category as any,
        imageUrl: newThemeData.imageUrl,
        type: newThemeData.type,
    };
    
    setThemes(prevThemes => [newTheme, ...prevThemes]);
  };

  const updateTheme = async (updatedTheme: Theme) => {
    const { id, imageUrl, ...restThemeData } = updatedTheme;
    const updateData: any = { ...restThemeData, imageUrl };
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(doc(db, 'themes', id), updateData);
    
    setThemes(prevThemes =>
      prevThemes.map(t => (t.id === updatedTheme.id ? { ...updatedTheme } : t))
    );
  };

  const deleteTheme = async (themeId: string) => {
    await deleteDoc(doc(db, 'themes', themeId));
    setThemes(prevThemes => prevThemes.filter(t => t.id !== themeId));
  };

  const addMugOrder = async (orderData: Omit<MugOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder = {
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'mug_orders'), newOrder);
    return docRef.id;
  };

  const updateMugOrderStatus = async (orderId: string, status: 'pending' | 'completed') => {
    await updateDoc(doc(db, 'mug_orders', orderId), { status });
  };

  const deleteMugOrder = async (orderId: string) => {
    await deleteDoc(doc(db, 'mug_orders', orderId));
  };

  return (
    <ThemeContext.Provider value={{ 
      themes, 
      mugOrders, 
      addTheme, 
      updateTheme, 
      deleteTheme,
      addMugOrder,
      updateMugOrderStatus,
      deleteMugOrder
    }}>
      {!loading && children}
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
