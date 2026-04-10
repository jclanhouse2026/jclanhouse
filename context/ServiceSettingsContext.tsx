import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { ServiceSetting } from '../types';
import { supabase } from '../lib/supabase';

interface ServiceSettingsContextType {
  serviceSettings: ServiceSetting[];
  updateServiceSettings: (settings: ServiceSetting[]) => Promise<void>;
}

const ServiceSettingsContext = createContext<ServiceSettingsContextType | undefined>(undefined);

export const ServiceSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceSettings, setServiceSettings] = useState<ServiceSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('settings')
            .select('data')
            .eq('id', 'services')
            .single();
        
        if (data) {
            setServiceSettings(data.data.settings || []);
        } else {
            setServiceSettings([]);
        }
        setLoading(false);
    };

    fetchSettings();

    const subscription = supabase
        .channel('services-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.services' }, (payload) => {
            if (payload.new) {
                const data = payload.new as any;
                setServiceSettings(data.data.settings || []);
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(subscription);
    };
  }, []);

  const updateServiceSettings = async (newSettings: ServiceSetting[]) => {
    const updated = newSettings.map(s => s.id ? s : { ...s, id: Date.now().toString() + Math.random() });
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({ id: 'services', data: { settings: updated } });
        
        if (error) throw error;
    } catch (e) {
        console.error("Error updating service settings:", e);
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
