import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getLocalData, setLocalData } from '../lib/storage_helper';

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
    phone: '+5594991083745',
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
    const fetchCompanyInfo = () => {
        if (!user) {
            setCompanyInfo(defaultCompanyInfo);
            return;
        }
        const data = getLocalData<CompanyInfo>('company_info', defaultCompanyInfo);
        setCompanyInfo(data);
    };
    fetchCompanyInfo();
  }, [user]);


  const updateCompanyInfo = async (infoUpdate: Partial<CompanyInfo>) => {
    if (!user) return;
    const updated = { ...companyInfo, ...infoUpdate };
    setCompanyInfo(updated);
    setLocalData('company_info', updated);
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
