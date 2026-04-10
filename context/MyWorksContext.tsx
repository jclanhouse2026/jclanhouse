import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getLocalData, setLocalData } from '../lib/storage_helper';

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

  const fetchWorks = useCallback(async () => {
    setError(null);
    const data = getLocalData<MyWork[]>('my_works', []);
    setWorks(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const addWork = async (workData: Omit<MyWork, 'id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar trabalho.");

    const newWork: MyWork = {
        ...workData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
    };

    const updated = [newWork, ...works];
    setWorks(updated);
    setLocalData('my_works', updated);
  };

  const updateWork = async (updatedWork: Omit<MyWork, 'created_at'>) => {
    const updated = works.map(w => (w.id === updatedWork.id ? { ...w, ...updatedWork } : w));
    setWorks(updated);
    setLocalData('my_works', updated);
  };

  const deleteWork = async (workId: string) => {
    const updated = works.filter(w => w.id !== workId);
    setWorks(updated);
    setLocalData('my_works', updated);
  };


  return (
    <MyWorksContext.Provider value={{ works, error, addWork, updateWork, deleteWork, refetchWorks: fetchWorks }}>
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
