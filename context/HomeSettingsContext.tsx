import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { HomeSettings } from '../types';
import { getLocalData, setLocalData } from '../lib/storage_helper';

const initialSettings: HomeSettings = {
  hero: { 
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", 
    title: "Bem-vindo à JC LAN HOUSE", 
    subtitle: "Serviços de impressão, encadernação, currículos e muito mais." 
  },
  categories: [
    { id: '1', name: "Encadernação", icon: "BookOpenIcon", link: "/apostila" },
    { id: '2', name: "Adesivos", icon: "TagIcon", link: "/adesivos-personalizados" },
    { id: '3', name: "Currículos", icon: "DocumentTextIcon", link: "/curriculo" },
    { id: '4', name: "Impressões", icon: "PrinterIcon", link: "/impressao" }
  ],
  differentials: [
    { id: '1', icon: "LightningBoltIcon", title: "Rapidez", description: "Entregamos seus serviços no menor tempo possível." },
    { id: '2', icon: "StarIcon", title: "Qualidade", description: "Utilizamos os melhores materiais do mercado." },
    { id: '3', icon: "HeartIcon", title: "Atendimento", description: "Foco total na satisfação dos nossos clientes." }
  ],
  footer: {
    aboutText: "A JC LAN HOUSE é a sua parceira ideal para serviços gráficos, impressões e soluções digitais rápidas e com qualidade.", 
    siteLinks: [
      { id: '1', text: "Home", link: "/" },
      { id: '2', text: "Serviços", link: "/servicos" },
      { id: '3', text: "Portfólio", link: "/portfolio" }
    ], 
    serviceLinks: [
      { id: '1', text: "Impressões", link: "/impressao" },
      { id: '2', text: "Currículos", link: "/curriculo" },
      { id: '3', text: "Encadernação", link: "/apostila" }
    ],
    contact: { email: "contato@jclanhouse.com", phone: "(00) 0000-0000", whatsapp: "5500000000000" }
  },
  mugThemesBanner: {
    enabled: true,
    title: "Temas de Canecas Personalizadas",
    subtitle: "Escolha entre centenas de estampas exclusivas para sua caneca. Temos temas para todas as ocasiões: Dia das Mães, Pais, Infantil, Geek e muito mais!",
    buttonText: "VER TODOS OS TEMAS",
    link: "/temas-canecas",
    fullClickable: true
  }
};


interface HomeSettingsContextType {
  settings: HomeSettings;
  updateSettings: (newSettings: HomeSettings) => Promise<void>;
}

const HomeSettingsContext = createContext<HomeSettingsContextType | undefined>(undefined);

export const HomeSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<HomeSettings>(initialSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = () => {
        const data = getLocalData<HomeSettings>('home_settings', initialSettings);
        setSettings(data);
        setLoading(false);
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: HomeSettings) => {
    setSettings(newSettings);
    setLocalData('home_settings', newSettings);
  };

  return (
    <HomeSettingsContext.Provider value={{ settings, updateSettings }}>
      {!loading && children}
    </HomeSettingsContext.Provider>
  );
};

export const useHomeSettings = (): HomeSettingsContextType => {
  const context = useContext(HomeSettingsContext);
  if (!context) {
    throw new Error('useHomeSettings must be used within a HomeSettingsProvider');
  }
  return context;
};
