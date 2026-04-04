import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { HomeSettings } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'home_settings', 'default');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().settings) {
                const fetched = docSnap.data().settings;
                // Faz um "deep merge" para garantir que todas as chaves esperadas existam,
                // prevenindo erros de "cannot read property of undefined".
                const fetchedHero = fetched.hero || {};
                const mergedSettings: HomeSettings = {
                    hero: { 
                        ...initialSettings.hero, 
                        ...fetchedHero,
                        imageUrl: fetchedHero.imageUrl || initialSettings.hero.imageUrl,
                        title: fetchedHero.title || initialSettings.hero.title,
                        subtitle: fetchedHero.subtitle || initialSettings.hero.subtitle
                    },
                    categories: fetched.categories && fetched.categories.length > 0 ? fetched.categories : initialSettings.categories,
                    differentials: fetched.differentials && fetched.differentials.length > 0 ? fetched.differentials : initialSettings.differentials,
                    footer: {
                        ...initialSettings.footer,
                        ...(fetched.footer || {}),
                        contact: { ...initialSettings.footer.contact, ...(fetched.footer?.contact || {}) },
                        siteLinks: fetched.footer?.siteLinks || initialSettings.footer.siteLinks,
                        serviceLinks: fetched.footer?.serviceLinks || initialSettings.footer.serviceLinks,
                    }
                };
                setSettings(mergedSettings);
            } else {
                // Se não houver dados no banco, usa os dados iniciais.
                setSettings(initialSettings);
            }
        } catch (error) {
            console.error("Exceção ao buscar configurações da home:", (error as Error).message);
            setSettings(initialSettings);
        } finally {
            setLoading(false);
        }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: HomeSettings) => {
    try {
        const docRef = doc(db, 'home_settings', 'default');
        await setDoc(docRef, { settings: newSettings }, { merge: true });
        setSettings(newSettings);
    } catch (error) {
        console.error("Erro ao atualizar configurações da home:", (error as Error).message);
    }
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
