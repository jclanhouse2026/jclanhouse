import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { ServiceSetting } from '../types';
import { getLocalData, setLocalData } from '../lib/storage_helper';

interface ServiceSettingsContextType {
  serviceSettings: ServiceSetting[];
  updateServiceSettings: (settings: ServiceSetting[]) => Promise<void>;
}

const ServiceSettingsContext = createContext<ServiceSettingsContextType | undefined>(undefined);

export const ServiceSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceSettings, setServiceSettings] = useState<ServiceSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = () => {
    setLoading(true);
    const data = getLocalData<ServiceSetting[]>('service_settings', []);
    setServiceSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateServiceSettings = async (newSettings: ServiceSetting[]) => {
    const updated = newSettings.map(s => s.id ? s : { ...s, id: Date.now().toString() + Math.random() });
    setServiceSettings(updated);
    setLocalData('service_settings', updated);
  };

  return (
    <ServiceSettingsContext.Provider value={{ serviceSettings, updateServiceSettings }}>
      {!loading && children}
    </ServiceSettingsContext.Provider>
  );
};

export const useServiceSettings = (): ServiceSettingsContextType => {
  const context = useContext(ServiceSettingsContext);
  if (!context) {
    throw new Error('useServiceSettings must be used within a ServiceSettingsProvider');
  }
  return context;
};
