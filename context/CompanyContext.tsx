import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from '../lib/localDb';

interface CompanyInfo {
    name: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    zip: string;
    logo: string | null;
}

const defaultCompanyInfo: CompanyInfo = {
    name: 'JC LAN HOUSE',
    cnpj: '00.000.000/0001-00',
    phone: '(81) 98888-8888',
    email: 'contato@jclanhouse.com',
    address: 'Rua Principal, 123, Centro',
    zip: '50000-000',
    logo: null,
};

interface CompanyContextType {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
        if (!user) {
            setCompanyInfo(defaultCompanyInfo);
            return;
        }

        try {
            const docRef = doc(db, 'company_info', user.id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompanyInfo({
                    name: data.name,
                    cnpj: data.cnpj,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    zip: data.zip,
                    logo: data.logo,
                });
            } else {
                // Se não houver info, use o padrão
                setCompanyInfo(defaultCompanyInfo);
            }
        } catch (e) {
            console.error("Exceção ao buscar informações da empresa:", (e as Error).message);
            setCompanyInfo(defaultCompanyInfo);
        }
    };
    fetchCompanyInfo();
  }, [user]);


  const updateCompanyInfo = async (infoUpdate: Partial<CompanyInfo>) => {
    if (!user) return;

    try {
        const docRef = doc(db, 'company_info', user.id);
        await setDoc(docRef, { user_id: user.id, ...infoUpdate }, { merge: true });
        setCompanyInfo(prev => ({ ...prev, ...infoUpdate }));
    } catch (error) {
        console.error("Erro ao atualizar informações da empresa:", (error as Error).message);
    }
  };

  return (
    <CompanyContext.Provider value={{ companyInfo, updateCompanyInfo }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
