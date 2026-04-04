import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, onSnapshot, query, getDoc } from 'firebase/firestore';

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

const defaultSettings: Omit<ApostilaSettings, 'id'> = {
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

export const ApostilaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ApostilaSettings | null>(null);
  const [colors, setColors] = useState<ApostilaColor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, 'apostila_settings', 'default'), (doc) => {
      if (doc.exists()) {
        setSettings({ id: doc.id, ...doc.data() } as ApostilaSettings);
      } else {
        setSettings({ id: 'default', ...defaultSettings });
      }
      setLoading(false);
    });

    const unsubscribeColors = onSnapshot(collection(db, 'apostila_colors'), (snapshot) => {
      const colorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApostilaColor));
      setColors(colorsData);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeColors();
    };
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
