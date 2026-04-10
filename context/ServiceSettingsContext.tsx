import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { ServiceSetting } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';

interface ServiceSettingsContextType {
  serviceSettings: ServiceSetting[];
  updateServiceSettings: (settings: ServiceSetting[]) => Promise<void>;
}

const ServiceSettingsContext = createContext<ServiceSettingsContextType | undefined>(undefined);

export const ServiceSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceSettings, setServiceSettings] = useState<ServiceSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'service_settings'));
      const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      } as ServiceSetting));
      setServiceSettings(data);
    } catch (error) {
      // console.error("Erro ao buscar configurações de serviço:", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateServiceSettings = async (newSettings: ServiceSetting[]) => {
    try {
      const batch = writeBatch(db);
      
      // Delete all existing
      const querySnapshot = await getDocs(collection(db, 'service_settings'));
      querySnapshot.forEach((document) => {
        batch.delete(doc(db, 'service_settings', document.id));
      });
      
      // Insert new
      newSettings.forEach((setting) => {
        const { id, ...rest } = setting;
        const newDocRef = doc(collection(db, 'service_settings'));
        batch.set(newDocRef, rest);
      });
      
      await batch.commit();
      
      // Re-fetch to get new IDs and ensure consistency
      await fetchSettings();
    } catch (error) {
      console.error("Erro ao atualizar configurações de serviço:", (error as Error).message);
    }
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
