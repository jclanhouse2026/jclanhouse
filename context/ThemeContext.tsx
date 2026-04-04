import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Theme } from '../types';
import { db, storage } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from './AuthContext';

const THEME_BUCKET = 'themes';

// Helper to convert data URL to Blob
const dataURLtoBlob = (dataurl: string): Blob | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

interface ThemeContextType {
  themes: Theme[];
  addTheme: (theme: Omit<Theme, 'id'>) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemes = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'themes'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Theme));
            setThemes(data);
        } catch (error) {
            console.error("Erro ao buscar temas:", (error as Error).message);
        } finally {
            setLoading(false);
        }
    };
    fetchThemes();
  }, []);

  const addTheme = async (themeData: Omit<Theme, 'id'>) => {
    if (!user) throw new Error("Usuário não autenticado para adicionar tema.");

    const { imageUrl, ...restThemeData } = themeData;
    let publicUrl = '';

    if (imageUrl.startsWith('data:image')) {
        const blob = dataURLtoBlob(imageUrl);
        if (!blob) throw new Error('Dados de imagem inválidos');
        const filePath = `${THEME_BUCKET}/${Date.now()}.jpg`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
        publicUrl = await getDownloadURL(storageRef);
    } else {
        publicUrl = imageUrl;
    }
    
    const newThemeData = { ...restThemeData, imageUrl: publicUrl, user_id: user.id };
    const docRef = await addDoc(collection(db, 'themes'), newThemeData);
    
    const newTheme: Theme = {
        id: docRef.id,
        name: newThemeData.name,
        category: newThemeData.category as any,
        imageUrl: newThemeData.imageUrl,
    };
    
    setThemes(prevThemes => [newTheme, ...prevThemes]);
  };

  const updateTheme = async (updatedTheme: Theme) => {
    const { id, imageUrl, ...restThemeData } = updatedTheme;
    let publicUrl = imageUrl;

    if (imageUrl.startsWith('data:image')) {
        const oldTheme = themes.find(t => t.id === id);
        if (oldTheme?.imageUrl && !oldTheme.imageUrl.startsWith('data:image')) {
            try {
                const urlObj = new URL(oldTheme.imageUrl);
                const pathParts = urlObj.pathname.split('/o/');
                if (pathParts.length > 1) {
                    const filePath = decodeURIComponent(pathParts[1].split('?')[0]);
                    const storageRef = ref(storage, filePath);
                    await deleteObject(storageRef);
                }
            } catch (e) { console.error("Não foi possível analisar ou deletar a imagem antiga do tema", e); }
        }

        const blob = dataURLtoBlob(imageUrl);
        if (!blob) throw new Error('Dados de imagem inválidos');
        const filePath = `${THEME_BUCKET}/${id}/${Date.now()}.jpg`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
        publicUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'themes', id), { ...restThemeData, imageUrl: publicUrl });
    
    setThemes(prevThemes =>
      prevThemes.map(t => (t.id === updatedTheme.id ? { ...updatedTheme, imageUrl: publicUrl } : t))
    );
  };

  const deleteTheme = async (themeId: string) => {
    const themeToDelete = themes.find(t => t.id === themeId);
    if (themeToDelete?.imageUrl && !themeToDelete.imageUrl.startsWith('data:image')) {
        try {
            const urlObj = new URL(themeToDelete.imageUrl);
            const pathParts = urlObj.pathname.split('/o/');
            if (pathParts.length > 1) {
                const filePath = decodeURIComponent(pathParts[1].split('?')[0]);
                const storageRef = ref(storage, filePath);
                await deleteObject(storageRef);
            }
        } catch (e) { console.error("Não foi possível deletar a imagem do tema do storage", e); }
    }
      
    await deleteDoc(doc(db, 'themes', themeId));
    setThemes(prevThemes => prevThemes.filter(t => t.id !== themeId));
  };

  return (
    <ThemeContext.Provider value={{ themes, addTheme, updateTheme, deleteTheme }}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};

export const useThemes = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemes must be used within a ThemeProvider');
  }
  return context;
};
