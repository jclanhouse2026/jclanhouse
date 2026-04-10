import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const q = query(collection(db, 'my_works'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MyWork));
        
        setWorks(data);
    } catch (err: any) {
        const userMessage = "Erro ao carregar os trabalhos.";
        // console.error("Erro detalhado ao buscar trabalhos:", err.message);
        setError(userMessage);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const addWork = async (workData: Omit<MyWork, 'id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar trabalho.");

    const newWork = {
        ...workData,
        user_id: user.id,
        created_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'my_works'), newWork);
    
    setWorks(prev => [{ id: docRef.id, ...newWork } as MyWork, ...prev]);
  };

  const updateWork = async (updatedWork: Omit<MyWork, 'created_at'>) => {
    const { id, ...workData } = updatedWork;
    
    await updateDoc(doc(db, 'my_works', id), workData);

    setWorks(prev => prev.map(w => (w.id === id ? { ...w, ...workData } : w)));
  };

  const deleteWork = async (workId: string) => {
    await deleteDoc(doc(db, 'my_works', workId));
    setWorks(prev => prev.filter(w => w.id !== workId));
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
