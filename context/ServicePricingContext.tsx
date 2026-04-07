import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Estrutura de tipo para os dados de precificação.
// Isso pode ser expandido para ser mais estrito se necessário.
export type ServicePricingData = any;

const initialPricingData: ServicePricingData = {
    caderneta: { 
        mainOptions: [
            { id: 'simples', name: 'Simples', price: 35.00 },
            { id: 'luxo', name: 'Luxo (Capa Dura)', price: 55.00 }
        ], 
        luxuryAddons: [
            { id: 'elastico', name: 'Elástico', price: 5.00 },
            { id: 'chaveiro', name: 'Chaveiro', price: 10.00 },
            { id: 'tassel', name: 'Tassel', price: 8.00 }
        ] 
    },
    adesivos_escolares: { 
        packages: [
            { id: 'p', name: 'Kit P (40 adesivos)', description: 'Ideal para lápis e canetas', size: '5x1cm', price: 25.00 },
            { id: 'm', name: 'Kit M (80 adesivos)', description: 'Ideal para cadernos', size: '8x4cm', price: 45.00 },
            { id: 'g', name: 'Kit G (120 adesivos)', description: 'Kit completo', size: 'Vários', price: 60.00 }
        ], 
        materials: [
            { id: 'vinil', name: 'Vinil Adesivo (À prova d\'água)', priceModifier: 1.0 }
        ] 
    },
    adesivos_premium: { 
        sizes: [
            { id: 's3', size: 3, price: 0.15 },
            { id: 's4', size: 4, price: 0.25 },
            { id: 's5', size: 5, price: 0.40 },
            { id: 's6', size: 6, price: 0.60 },
            { id: 's7', size: 7, price: 0.85 },
            { id: 's8', size: 8, price: 1.15 },
            { id: 's9', size: 9, price: 1.50 },
            { id: 's10', size: 10, price: 1.90 }
        ], 
        formats: ['redondo', 'quadrado'], 
        materials: [
            { id: 'papel', name: 'Papel Fotográfico', priceModifier: 1.0, priceText: 'Econômico' },
            { id: 'vinil', name: 'Vinil Branco', priceModifier: 1.5, priceText: 'Resistente' },
            { id: 'transparente', name: 'Vinil Transparente', priceModifier: 1.8, priceText: 'Premium' }
        ], 
        lamination: { name: 'Laminação Brilho', pricePerUnit: 0.10, priceText: '+ R$ 0,10/un' } 
    },
    cartoes_visita: { 
        quantities: [
            { quantity: 100, multiplier: 1.0 },
            { quantity: 200, multiplier: 1.4 },
            { quantity: 500, multiplier: 2.2 },
            { quantity: 1000, multiplier: 4.0 }
        ], 
        papers: [
            { id: 'couche250', name: 'Couchê 250g', description: 'Padrão Econômico', basePrice: 45.00 },
            { id: 'couche300', name: 'Couchê 300g', description: 'Mais Firme e Elegante', basePrice: 65.00 }
        ], 
        addons: [
            { id: 'lamination', name: 'Laminação Fosca', priceMultiplier: 1.3 },
            { id: 'twoSided', name: 'Frente e Verso', priceMultiplier: 1.5 }
        ] 
    },
    panfletos: { 
        formats: [
            { id: '10x14', name: '10x14 cm', description: 'Tamanho A6' },
            { id: '15x21', name: '15x21 cm', description: 'Tamanho A5' }
        ], 
        quantities: [500, 1000, 2500, 5000], 
        prices: {
            '10x14': { 500: 85.00, 1000: 120.00, 2500: 240.00, 5000: 420.00 },
            '15x21': { 500: 140.00, 1000: 195.00, 2500: 380.00, 5000: 650.00 }
        } 
    },
    impressao: { 
        basePrice: 0.50, 
        techModifiers: {
            laser: { base: 1.0, color: 2.5 },
            inkjet: { base: 0.5, color: 1.5 }
        }, 
        formatModifiers: [
            { id: 'a4', name: 'A4', multiplier: 1.0 },
            { id: 'a3', name: 'A3', multiplier: 2.0 }
        ], 
        mediaModifiers: [
            { id: 'comum', name: 'Papel Comum 75g', price: 0 },
            { id: 'fotografico', name: 'Papel Fotográfico', price: 2.50 }
        ] 
    }
};

interface ServicePricingContextType {
  pricing: ServicePricingData;
  loading: boolean;
  updatePricing: (newPricing: ServicePricingData) => Promise<void>;
}

const ServicePricingContext = createContext<ServicePricingContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'app_service_pricing';

export const ServicePricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pricing, setPricing] = useState<ServicePricingData>(initialPricingData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = () => {
        setLoading(true);
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            
            if (storedData) {
                const fetchedData = JSON.parse(storedData);
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
                setPricing(initialPricingData);
            }
        } catch (error) {
            console.error("Erro ao buscar configurações de preço:", (error as Error).message);
            setPricing(initialPricingData);
        } finally {
            setLoading(false);
        }
    };
    fetchPricing();
  }, []);

  const updatePricing = async (newPricing: ServicePricingData) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPricing));
        setPricing(newPricing);
    } catch (error) {
        console.error("Erro ao atualizar configurações de preço:", (error as Error).message);
        throw error;
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
