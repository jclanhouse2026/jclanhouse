import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    // Real-time subscription
    const subscription = supabase
      .channel('categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCategories]);

  const addCategory = async (name: string) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar categoria.");

    const { error } = await supabase
      .from('categories')
      .insert([{ name, subcategories: [] }]);
    
    if (error) throw error;
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id);
    
    if (error) throw error;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };
  
  const addSubcategory = async (parentId: string, name: string) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar subcategoria.");

    const category = categories.find(c => c.id === parentId);
    if (!category) return;

    const newSub = { id: (Date.now() + Math.random()).toString(), name };
    const updatedSubcategories = [...(category.subcategories || []), newSub];

    const { error } = await supabase
      .from('categories')
      .update({ subcategories: updatedSubcategories })
      .eq('id', parentId);
    
    if (error) throw error;
  };

  const updateSubcategory = async (parentId: string, subId: string, name: string) => {
    const category = categories.find(c => c.id === parentId);
    if (!category) return;

    const updatedSubcategories = category.subcategories.map(sub => 
      sub.id === subId ? { ...sub, name } : sub
    );

    const { error } = await supabase
      .from('categories')
      .update({ subcategories: updatedSubcategories })
      .eq('id', parentId);
    
    if (error) throw error;
  };

  const deleteSubcategory = async (parentId: string, subId: string) => {
    const category = categories.find(c => c.id === parentId);
    if (!category) return;

    const updatedSubcategories = category.subcategories.filter(sub => sub.id !== subId);

    const { error } = await supabase
      .from('categories')
      .update({ subcategories: updatedSubcategories })
      .eq('id', parentId);
    
    if (error) throw error;
  };

  return (
    <CategoryContext.Provider value={{ categories, loading, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory }}>
      {children}
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
