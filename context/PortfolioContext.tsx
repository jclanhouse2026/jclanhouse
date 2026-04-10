import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { PortfolioProduct } from '../types';
import { getLocalData, setLocalData } from '../lib/storage_helper';
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
  const { user } = useAuth();
  const { sendNotificationToAll } = useNotifications();
  const [products, setProducts] = useState<PortfolioProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(() => {
    setLoading(true);
    const data = getLocalData<PortfolioProduct[]>('portfolio_products', []);
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const addProduct = async (productData: Omit<PortfolioProduct, 'id'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar produto.");
    
    const { images, ...productInfo } = productData;
    
    // Convert images to data URLs if they have files
    const processedImages = await Promise.all(images.map(async (img) => {
        if (img.file) {
            const url = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(img.file!);
            });
            return { id: Date.now().toString() + Math.random(), url };
        }
        return { id: img.id, url: img.url };
    }));

    const newProduct: PortfolioProduct = {
        ...productInfo,
        id: Date.now().toString(),
        images: processedImages
    };

    const updated = [...products, newProduct];
    setProducts(updated);
    setLocalData('portfolio_products', updated);

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
            const url = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(img.file!);
            });
            return { id: Date.now().toString() + Math.random(), url };
        }
        return { id: img.id, url: img.url };
    }));

    const updated = products.map(p => p.id === id ? { ...p, ...productInfo, images: processedImages } : p);
    setProducts(updated);
    setLocalData('portfolio_products', updated);
  };

  const deleteProduct = async (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    setLocalData('portfolio_products', updated);
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
