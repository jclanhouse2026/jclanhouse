import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
  updateCompanyInfo: (info: Partial<CompanyInfo>) => Promise<void>;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('data')
                .eq('id', 'company_info')
                .single();
            
            if (data) {
                setCompanyInfo({ ...defaultCompanyInfo, ...data.data });
            } else {
                setCompanyInfo(defaultCompanyInfo);
            }
        } catch (error) {
            console.error("Error fetching company info:", error);
            setCompanyInfo(defaultCompanyInfo);
        } finally {
            setLoading(false);
        }
    };
    fetchCompanyInfo();
  }, []);


  const updateCompanyInfo = async (infoUpdate: Partial<CompanyInfo>) => {
    const updated = { ...companyInfo, ...infoUpdate };
    setCompanyInfo(updated);
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({ id: 'company_info', data: updated });
        
        if (error) throw error;
    } catch (error) {
        console.error("Error updating company info:", error);
    }
  };

  return (
    <CompanyContext.Provider value={{ companyInfo, updateCompanyInfo, loading }}>
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
