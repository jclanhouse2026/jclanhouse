import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { PortfolioProduct, PortfolioImage } from '../types';
import { db, storage } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from './AuthContext';

const BUCKET_NAME = 'portfolio';

interface PortfolioContextType {
  products: PortfolioProduct[];
  addProduct: (product: Omit<PortfolioProduct, 'id'>) => Promise<void>;
  updateProduct: (product: PortfolioProduct) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<PortfolioProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productsSnapshot = await getDocs(collection(db, 'portfolio_products'));
            const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

            const imagesSnapshot = await getDocs(collection(db, 'portfolio_images'));
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
            console.error("Erro ao buscar produtos:", (error as Error).message);
        } finally {
            setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<PortfolioProduct, 'id'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar produto.");
    const { images, ...productInfo } = productData;
    
    const newProductData = {
        user_id: user.id,
        name: productInfo.name,
        description: productInfo.description,
        original_price: productInfo.originalPrice,
        promo_price: productInfo.promoPrice,
        type: productInfo.type,
        category_id: productInfo.categoryId,
        subcategory_id: productInfo.subcategoryId,
    };

    const docRef = await addDoc(collection(db, 'portfolio_products'), newProductData);
    
    const uploadedImageRecords: { product_id: string; url: string }[] = [];
    for (const img of images) {
      if (img.file) {
        const filePath = `${BUCKET_NAME}/${docRef.id}/${Date.now()}_${img.file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, img.file);
        const url = await getDownloadURL(storageRef);
        uploadedImageRecords.push({ product_id: docRef.id, url });
      }
    }

    let newImages: PortfolioImage[] = [];
    if (uploadedImageRecords.length > 0) {
      const batch = writeBatch(db);
      for (const record of uploadedImageRecords) {
          const imgRef = doc(collection(db, 'portfolio_images'));
          batch.set(imgRef, record);
          newImages.push({ id: imgRef.id, url: record.url });
      }
      await batch.commit();
    }

    const finalProduct: PortfolioProduct = {
      id: docRef.id,
      name: newProductData.name,
      description: newProductData.description,
      originalPrice: newProductData.original_price,
      promoPrice: newProductData.promo_price,
      type: newProductData.type,
      categoryId: newProductData.category_id,
      subcategoryId: newProductData.subcategory_id,
      images: newImages,
    };
    setProducts(prev => [finalProduct, ...prev]);
  };

  const updateProduct = async (updatedProduct: PortfolioProduct) => {
    const { id, images, ...productInfo } = updatedProduct;

    await updateDoc(doc(db, 'portfolio_products', id), {
        name: productInfo.name,
        description: productInfo.description,
        original_price: productInfo.originalPrice,
        promo_price: productInfo.promoPrice,
        type: productInfo.type,
        category_id: productInfo.categoryId,
        subcategory_id: productInfo.subcategoryId,
    });
    
    const oldImagesQuery = query(collection(db, 'portfolio_images'), where('product_id', '==', id));
    const oldImagesSnapshot = await getDocs(oldImagesQuery);
    
    const oldImages = oldImagesSnapshot.docs.map(doc => ({ id: doc.id, url: doc.data().url }));

    if (oldImages && oldImages.length > 0) {
      for (const img of oldImages) {
        try {
            // Extrair o caminho do storage da URL (simplificado, pode precisar de ajuste dependendo do formato da URL do Firebase Storage)
            const urlObj = new URL(img.url);
            const pathParts = urlObj.pathname.split('/o/');
            if (pathParts.length > 1) {
                const filePath = decodeURIComponent(pathParts[1].split('?')[0]);
                const storageRef = ref(storage, filePath);
                await deleteObject(storageRef);
            }
        } catch (e) {
            console.error("Erro ao deletar imagem antiga do storage:", e);
        }
      }
    }

    const batch = writeBatch(db);
    oldImagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    
    const newImageRecords: { product_id: string; url: string; }[] = [];
    for (const img of images) {
        if (img.file) { // New image to upload
            const filePath = `${BUCKET_NAME}/${id}/${Date.now()}_${img.file.name}`;
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, img.file);
            const url = await getDownloadURL(storageRef);
            newImageRecords.push({ product_id: id, url });
        } else { // Existing image to keep
            newImageRecords.push({ product_id: id, url: img.url });
        }
    }

    let finalImages: PortfolioImage[] = [];
    if (newImageRecords.length > 0) {
        const batch2 = writeBatch(db);
        for (const record of newImageRecords) {
            const imgRef = doc(collection(db, 'portfolio_images'));
            batch2.set(imgRef, record);
            finalImages.push({ id: imgRef.id, url: record.url });
        }
        await batch2.commit();
    }

    setProducts(prev => prev.map(p => (p.id === id ? { ...updatedProduct, images: finalImages } : p)));
  };

  const deleteProduct = async (productId: string) => {
    const imagesQuery = query(collection(db, 'portfolio_images'), where('product_id', '==', productId));
    const imagesSnapshot = await getDocs(imagesQuery);
    
    const images = imagesSnapshot.docs.map(doc => ({ id: doc.id, url: doc.data().url }));
    
    if (images && images.length > 0) {
        for (const img of images) {
            try {
                const urlObj = new URL(img.url);
                const pathParts = urlObj.pathname.split('/o/');
                if (pathParts.length > 1) {
                    const filePath = decodeURIComponent(pathParts[1].split('?')[0]);
                    const storageRef = ref(storage, filePath);
                    await deleteObject(storageRef);
                }
            } catch (e) {
                console.error("Erro ao deletar imagem do storage:", e);
            }
        }
        
        const batch = writeBatch(db);
        imagesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    await deleteDoc(doc(db, 'portfolio_products', productId));
    setProducts(prev => prev.filter(p => p.id !== productId));
  };


  return (
    <PortfolioContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {!loading && children}
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
