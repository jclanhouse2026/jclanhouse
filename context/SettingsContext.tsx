
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getLocalData, setLocalData } from '../lib/storage_helper';

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
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = () => {
      const data = getLocalData<AppSettings>('app_settings', defaultSettings);
      setSettings(data);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setLocalData('app_settings', updated);
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
