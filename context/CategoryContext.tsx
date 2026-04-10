import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Category, Subcategory } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (parentId: string, name: string) => Promise<void>;
  updateSubcategory: (parentId: string, subId: string, name: string) => Promise<void>;
  deleteSubcategory: (parentId: string, subId: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
        const catSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        const subcatSnapshot = await getDocs(collection(db, 'subcategories'));
        const subcategoriesData = subcatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        const combined = categoriesData.map(cat => ({
            ...cat,
            subcategories: subcategoriesData.filter(sub => sub.category_id === cat.id)
        }));
        setCategories(combined);
    } catch (error) {
        // console.error("Erro ao buscar categorias:", (error as Error).message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (name: string) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar categoria.");

    const docRef = await addDoc(collection(db, 'categories'), { name, user_id: user.id });
    setCategories(prev => [...prev, { id: docRef.id, name, subcategories: [] }]);
  };

  const updateCategory = async (id: string, name: string) => {
    await updateDoc(doc(db, 'categories', id), { name });
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name } : cat));
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };
  
  const addSubcategory = async (parentId: string, name: string) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar subcategoria.");

    const docRef = await addDoc(collection(db, 'subcategories'), { category_id: parentId, name, user_id: user.id });
    setCategories(prev => prev.map(cat => 
        cat.id === parentId ? { ...cat, subcategories: [...cat.subcategories, { id: docRef.id, name }] } : cat
    ));
  };

  const updateSubcategory = async (parentId: string, subId: string, name: string) => {
    await updateDoc(doc(db, 'subcategories', subId), { name });
    setCategories(prev => prev.map(cat => 
        cat.id === parentId 
            ? { ...cat, subcategories: cat.subcategories.map(sub => sub.id === subId ? { ...sub, name } : sub) }
            : cat
    ));
  };

  const deleteSubcategory = async (parentId: string, subId: string) => {
    await deleteDoc(doc(db, 'subcategories', subId));
    setCategories(prev => prev.map(cat => 
        cat.id === parentId 
            ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subId) }
            : cat
    ));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory }}>
      {!loading && children}
    </CategoryContext.Provider>
  );
};

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
