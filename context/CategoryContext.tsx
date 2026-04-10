import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Category } from '../types';
import { getLocalData, setLocalData } from '../lib/storage_helper';
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

  const fetchCategories = () => {
    setLoading(true);
    const data = getLocalData<Category[]>('categories', []);
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (name: string) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar categoria.");

    const newCategory: Category = { id: Date.now().toString(), name, subcategories: [] };
    const updated = [...categories, newCategory];
    setCategories(updated);
    setLocalData('categories', updated);
  };

  const updateCategory = async (id: string, name: string) => {
    const updated = categories.map(cat => cat.id === id ? { ...cat, name } : cat);
    setCategories(updated);
    setLocalData('categories', updated);
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(cat => cat.id !== id);
    setCategories(updated);
    setLocalData('categories', updated);
  };
  
  const addSubcategory = async (parentId: string, name: string) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar subcategoria.");

    const updated = categories.map(cat => 
        cat.id === parentId ? { ...cat, subcategories: [...cat.subcategories, { id: Date.now().toString() + Math.random(), name }] } : cat
    );
    setCategories(updated);
    setLocalData('categories', updated);
  };

  const updateSubcategory = async (parentId: string, subId: string, name: string) => {
    const updated = categories.map(cat => 
        cat.id === parentId 
            ? { ...cat, subcategories: cat.subcategories.map(sub => sub.id === subId ? { ...sub, name } : sub) }
            : cat
    );
    setCategories(updated);
    setLocalData('categories', updated);
  };

  const deleteSubcategory = async (parentId: string, subId: string) => {
    const updated = categories.map(cat => 
        cat.id === parentId 
            ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subId) }
            : cat
    );
    setCategories(updated);
    setLocalData('categories', updated);
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
