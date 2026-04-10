import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { PortfolioProduct, PortfolioImage } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { optimizeImage } from '../lib/imageUtils';
import { uploadFile } from '../lib/storage';

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

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'portfolio_products');
      const imagesRef = collection(db, 'portfolio_images');
      const q = query(productsRef, orderBy('name', 'asc'));

      const [productsSnapshot, imagesSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(imagesRef)
      ]);

      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const imagesData = imagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      const productsWithImages: PortfolioProduct[] = productsData.map(p => ({
        id: p.id,
        name: p.name,
        images: imagesData.filter(img => img.product_id === p.id).map(img => ({ id: img.id, url: img.url })),
        description: p.description,
        originalPrice: p.original_price,
        promoPrice: p.promo_price,
        type: p.type,
        categoryId: p.category_id,
        subcategoryId: p.subcategory_id,
      }));

      setProducts(productsWithImages);
    } catch (error) {
      // console.error("Erro ao buscar portfólio:", error);
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
    
    const newProductData: any = {
        user_id: user.id,
        name: productInfo.name,
        description: productInfo.description,
        original_price: productInfo.originalPrice,
        promo_price: productInfo.promoPrice,
        type: productInfo.type,
        category_id: productInfo.categoryId || null,
        subcategory_id: productInfo.subcategoryId || null,
        created_at: new Date().toISOString()
    };

    // Remove undefined fields
    Object.keys(newProductData).forEach(key => {
      if (newProductData[key] === undefined) {
        delete newProductData[key];
      }
    });

    const docRef = await addDoc(collection(db, 'portfolio_products'), newProductData);
    
    const uploadedImageRecords: { product_id: string; url: string }[] = [];
    for (const img of images) {
      if (img.file) {
        const optimizedFile = await optimizeImage(img.file, 800, 800, 0.8);
        const path = `portfolio/${docRef.id}/${Date.now()}_${optimizedFile.name}`;
        const imageUrl = await uploadFile(optimizedFile, path);
        uploadedImageRecords.push({ product_id: docRef.id, url: imageUrl });
      }
    }

    if (uploadedImageRecords.length > 0) {
      const batch = writeBatch(db);
      for (const record of uploadedImageRecords) {
          const imgRef = doc(collection(db, 'portfolio_images'));
          batch.set(imgRef, record);
      }
      await batch.commit();
    }

    // Notify all users about new product
    await sendNotificationToAll(
      'Novo Produto Disponível!',
      `O produto "${productInfo.name}" acabou de chegar em nossa loja. Confira agora!`,
      'success'
    );
  };

  const updateProduct = async (updatedProduct: PortfolioProduct) => {
    const { id, images, ...productInfo } = updatedProduct;

    const updateData: any = {
        name: productInfo.name,
        description: productInfo.description,
        original_price: productInfo.originalPrice,
        promo_price: productInfo.promoPrice,
        type: productInfo.type,
        category_id: productInfo.categoryId || null,
        subcategory_id: productInfo.subcategoryId || null,
        updated_at: new Date().toISOString()
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(doc(db, 'portfolio_products', id), updateData);
    
    // Handle images: delete old ones and upload new ones
    // For simplicity in this fix, we'll replace all images if any new ones are provided
    // or just keep the existing ones.
    
    const hasNewImages = images.some(img => !!img.file);
    
    if (hasNewImages) {
        // Delete old image records from Firestore
        const oldImagesQuery = query(collection(db, 'portfolio_images'), where('product_id', '==', id));
        const oldImagesSnapshot = await getDocs(oldImagesQuery);
        
        const batch = writeBatch(db);
        oldImagesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        // Upload new images
        const newImageRecords: { product_id: string; url: string; }[] = [];
        for (const img of images) {
            if (img.file) {
                const optimizedFile = await optimizeImage(img.file, 800, 800, 0.8);
                const path = `portfolio/${id}/${Date.now()}_${optimizedFile.name}`;
                const imageUrl = await uploadFile(optimizedFile, path);
                newImageRecords.push({ product_id: id, url: imageUrl });
            } else {
                newImageRecords.push({ product_id: id, url: img.url });
            }
        }

        if (newImageRecords.length > 0) {
            const batch2 = writeBatch(db);
            for (const record of newImageRecords) {
                const imgRef = doc(collection(db, 'portfolio_images'));
                batch2.set(imgRef, record);
            }
            await batch2.commit();
        }
    }
  };

  const deleteProduct = async (productId: string) => {
    const imagesQuery = query(collection(db, 'portfolio_images'), where('product_id', '==', productId));
    const imagesSnapshot = await getDocs(imagesQuery);
    
    const batch = writeBatch(db);
    imagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    await deleteDoc(doc(db, 'portfolio_products', productId));
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
