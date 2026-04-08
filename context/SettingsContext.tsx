
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { setCustomApiKey } from '../services/geminiService';

interface AppSettings {
  githubToken?: string;
  githubOwner?: string;
  githubRepo?: string;
  githubBranch?: string;
  useGitHubStorage: boolean;
  siteName: string;
  contactEmail: string;
  primaryColor: string;
  homeBgUrl: string;
  aiKey?: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: AppSettings = {
  useGitHubStorage: false,
  siteName: 'JC LAN HOUSE',
  contactEmail: 'contato@jclanhouse.com',
  primaryColor: '#06b6d4',
  homeBgUrl: 'https://picsum.photos/1920/1080?grayscale&blur=2',
  githubToken: '',
  githubOwner: '',
  githubRepo: '',
  githubBranch: 'main',
  aiKey: ''
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'app_settings', 'global');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        setSettings({ ...defaultSettings, ...data });
        if (data.aiKey) {
          setCustomApiKey(data.aiKey);
        }
      } else {
        // Initialize with defaults if doesn't exist
        setDoc(docRef, defaultSettings).catch(console.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const docRef = doc(db, 'app_settings', 'global');
    await setDoc(docRef, { ...settings, ...newSettings }, { merge: true });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
