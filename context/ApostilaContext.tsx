import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalData } from '../lib/storage_helper';

interface ApostilaSettings {
  id: string;
  price_bw: number;
  price_color: number;
  price_spiral: number;
  price_wireo: number;
  limit_spiral: number;
  limit_wireo: number;
  enable_double_sided: boolean;
  enable_spiral: boolean;
  enable_wireo: boolean;
  min_delivery_days: number;
}

interface ApostilaColor {
  id: string;
  name: string;
  hex: string;
  active: boolean;
}

interface ApostilaContextType {
  settings: ApostilaSettings | null;
  colors: ApostilaColor[];
  loading: boolean;
}

const ApostilaContext = createContext<ApostilaContextType | undefined>(undefined);

const defaultSettings: ApostilaSettings = {
  id: 'default',
  price_bw: 0.15,
  price_color: 0.50,
  price_spiral: 5.00,
  price_wireo: 10.00,
  limit_spiral: 300,
  limit_wireo: 120,
  enable_double_sided: true,
  enable_spiral: true,
  enable_wireo: true,
  min_delivery_days: 1
};

const defaultColors: ApostilaColor[] = [
    { id: 'c1', name: 'Azul', hex: '#3b82f6', active: true },
    { id: 'c2', name: 'Verde', hex: '#22c55e', active: true },
    { id: 'c3', name: 'Rosa', hex: '#ec4899', active: true },
    { id: 'c4', name: 'Amarelo', hex: '#eab308', active: true },
    { id: 'c5', name: 'Preto', hex: '#000000', active: true },
    { id: 'c6', name: 'Transparente', hex: '#ffffff', active: true },
];

export const ApostilaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ApostilaSettings | null>(null);
  const [colors, setColors] = useState<ApostilaColor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      const savedSettings = getLocalData<ApostilaSettings>('apostila_settings', defaultSettings);
      const savedColors = getLocalData<ApostilaColor[]>('apostila_colors', defaultColors);
      
      setSettings(savedSettings);
      setColors(savedColors);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <ApostilaContext.Provider value={{ settings, colors, loading }}>
      {children}
    </ApostilaContext.Provider>
  );
};

export const useApostila = () => {
  const context = useContext(ApostilaContext);
  if (context === undefined) {
    throw new Error('useApostila must be used within an ApostilaProvider');
  }
  return context;
};
