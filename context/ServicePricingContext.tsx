import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Estrutura de tipo para os dados de precificação.
// Isso pode ser expandido para ser mais estrito se necessário.
export type ServicePricingData = any;

const initialPricingData: ServicePricingData = {
    caderneta: { mainOptions: [], luxuryAddons: [] },
    adesivos_escolares: { packages: [], materials: [] },
    adesivos_premium: { 
        sizes: [], 
        formats: [], 
        materials: [], 
        lamination: { name: '', pricePerUnit: 0, priceText: '' } 
    },
    cartoes_visita: { quantities: [], papers: [], addons: [] },
    panfletos: { formats: [], quantities: [], prices: {} },
    impressao: { 
        basePrice: 0, 
        techModifiers: {
            laser: { base: 0, color: 0 },
            inkjet: { base: 0, color: 0 }
        }, 
        formatModifiers: [], 
        mediaModifiers: [] 
    }
};

interface ServicePricingContextType {
  pricing: ServicePricingData;
  loading: boolean;
  updatePricing: (newPricing: ServicePricingData) => Promise<void>;
}

const ServicePricingContext = createContext<ServicePricingContextType | undefined>(undefined);

export const ServicePricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pricing, setPricing] = useState<ServicePricingData>(initialPricingData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'service_pricing', 'default');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().config) {
                const fetchedData = docSnap.data().config;
                // Merge with initial data to ensure all nested properties exist
                const mergedData = {
                    ...initialPricingData,
                    ...fetchedData,
                    caderneta: {
                        ...initialPricingData.caderneta,
                        ...(fetchedData.caderneta || {})
                    },
                    adesivos_escolares: {
                        ...initialPricingData.adesivos_escolares,
                        ...(fetchedData.adesivos_escolares || {})
                    },
                    cartoes_visita: {
                        ...initialPricingData.cartoes_visita,
                        ...(fetchedData.cartoes_visita || {})
                    },
                    panfletos: {
                        ...initialPricingData.panfletos,
                        ...(fetchedData.panfletos || {})
                    },
                    impressao: {
                        ...initialPricingData.impressao,
                        ...(fetchedData.impressao || {}),
                        techModifiers: {
                            ...initialPricingData.impressao.techModifiers,
                            ...(fetchedData.impressao?.techModifiers || {})
                        }
                    },
                    adesivos_premium: {
                        ...initialPricingData.adesivos_premium,
                        ...(fetchedData.adesivos_premium || {}),
                        lamination: {
                            ...initialPricingData.adesivos_premium.lamination,
                            ...(fetchedData.adesivos_premium?.lamination || {})
                        }
                    }
                };
                setPricing(mergedData);
            } else {
                console.warn("Nenhuma configuração de preço encontrada no banco de dados. Usando valores iniciais.");
                setPricing(initialPricingData);
            }
        } catch (error) {
            console.error("Erro ao buscar configurações de preço:", (error as Error).message);
        } finally {
            setLoading(false);
        }
    };
    fetchPricing();
  }, []);

  const updatePricing = async (newPricing: ServicePricingData) => {
    try {
        const docRef = doc(db, 'service_pricing', 'default');
        await setDoc(docRef, { config: newPricing }, { merge: true });
        setPricing(newPricing);
    } catch (error) {
        console.error("Erro ao atualizar configurações de preço:", (error as Error).message);
        throw error; // Lança o erro para que o componente que chama possa lidar com ele
    }
  };

  return (
    <ServicePricingContext.Provider value={{ pricing, loading, updatePricing }}>
      {children}
    </ServicePricingContext.Provider>
  );
};

export const useServicePricing = (): ServicePricingContextType => {
  const context = useContext(ServicePricingContext);
  if (!context) {
    throw new Error('useServicePricing deve ser usado dentro de um ServicePricingProvider');
  }
  return context;
};
