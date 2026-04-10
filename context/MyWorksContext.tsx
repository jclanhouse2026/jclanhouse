import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface MyWork {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url?: string;
    created_at: string;
}

interface MyWorksContextType {
  works: MyWork[];
  error: string | null;
  addWork: (work: Omit<MyWork, 'id' | 'created_at'>) => Promise<void>;
  updateWork: (work: Omit<MyWork, 'created_at'>) => Promise<void>;
  deleteWork: (workId: string) => Promise<void>;
  refetchWorks: () => Promise<void>;
}

const MyWorksContext = createContext<MyWorksContextType | undefined>(undefined);

export const MyWorksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [works, setWorks] = useState<MyWork[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorks = async () => {
        const { data, error } = await supabase
            .from('my_works')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching my works:", error);
            setError("Erro ao carregar trabalhos.");
        } else {
            setWorks(data || []);
        }
    };

    fetchWorks();

    const subscription = supabase
        .channel('my_works-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'my_works' }, (payload) => {
            if (payload.eventType === 'INSERT') {
                setWorks(prev => [payload.new as MyWork, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setWorks(prev => prev.map(w => w.id === payload.new.id ? payload.new as MyWork : w));
            } else if (payload.eventType === 'DELETE') {
                setWorks(prev => prev.filter(w => w.id !== payload.old.id));
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(subscription);
    };
  }, []);

  const addWork = async (workData: Omit<MyWork, 'id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar trabalho.");

    const newWork = {
        ...workData,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('my_works')
        .insert([newWork]);
    
    if (error) throw error;
  };

  const updateWork = async (updatedWork: Omit<MyWork, 'created_at'>) => {
    const { id, ...data } = updatedWork;
    const { error } = await supabase
        .from('my_works')
        .update(data)
        .eq('id', id);
    
    if (error) throw error;
  };

  const deleteWork = async (workId: string) => {
    const { error } = await supabase
        .from('my_works')
        .delete()
        .eq('id', workId);
    
    if (error) throw error;
  };

  const refetchWorks = async () => {
    // Subscriptions handle this
  };

  return (
    <MyWorksContext.Provider value={{ works, error, addWork, updateWork, deleteWork, refetchWorks }}>
      {children}
    </MyWorksContext.Provider>
  );
};

export const useMyWorks = (): MyWorksContextType => {
  const context = useContext(MyWorksContext);
  if (!context) {
    throw new Error('useMyWorks must be used within a MyWorksProvider');
  }
  return context;
};
