import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { PortfolioProduct } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface PortfolioContextType {
  products: PortfolioProduct[];
  loading: boolean;
  addProduct: (product: Omit<PortfolioProduct, 'id'>) => Promise<void>;
  updateProduct: (product: PortfolioProduct) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, uploadFile } = useAuth();
  const { sendNotificationToAll } = useNotifications();
  const [products, setProducts] = useState<PortfolioProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('portfolio_products')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        setProducts(data || []);
    } catch (error) {
        console.error("Error fetching portfolio:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const addProduct = async (productData: Omit<PortfolioProduct, 'id'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar produto.");
    
    const { images, ...productInfo } = productData;
    
    // Upload images to Supabase Storage
    const processedImages = await Promise.all(images.map(async (img) => {
        if (img.file) {
            const path = `portfolio/${Date.now()}_${img.file.name}`;
            const url = await uploadFile(img.file, path);
            return { id: Date.now().toString() + Math.random(), url };
        }
        return { id: img.id, url: img.url };
    }));

    const newProduct = {
        ...productInfo,
        images: processedImages,
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('portfolio_products')
        .insert([newProduct])
        .select()
        .single();
    
    if (error) throw error;
    
    setProducts(prev => [data as PortfolioProduct, ...prev]);

    await sendNotificationToAll(
      'Novo Produto Disponível!',
      `O produto "${productInfo.name}" acabou de chegar em nossa loja. Confira agora!`,
      'success'
    );
  };

  const updateProduct = async (updatedProduct: PortfolioProduct) => {
    const { id, images, ...productInfo } = updatedProduct;

    const processedImages = await Promise.all(images.map(async (img) => {
        if (img.file) {
            const path = `portfolio/${Date.now()}_${img.file.name}`;
            const url = await uploadFile(img.file, path);
            return { id: Date.now().toString() + Math.random(), url };
        }
        return { id: img.id, url: img.url };
    }));

    const updateData = { ...productInfo, images: processedImages };
    const { error } = await supabase
        .from('portfolio_products')
        .update(updateData)
        .eq('id', id);
    
    if (error) throw error;

    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updateData } : p));
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
        .from('portfolio_products')
        .delete()
        .eq('id', productId);
    
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <PortfolioContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
