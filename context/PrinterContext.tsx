import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import type { Printer } from '../types';
import { useAuth } from './AuthContext';
import { getLocalData, setLocalData } from '../lib/storage_helper';

interface PrinterContextType {
  printers: Printer[];
  addPrinter: (printer: Omit<Printer, 'id' | 'isDefault'>) => Promise<void>;
  updatePrinter: (printer: Omit<Printer, 'isDefault'> & { id: string }) => Promise<void>;
  deletePrinter: (printerId: string) => Promise<void>;
  setDefaultPrinter: (printerId: string) => Promise<void>;
  getDefaultPrinter: () => Printer | null;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export const PrinterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [printers, setPrinters] = useState<Printer[]>([]);

  useEffect(() => {
    const fetchPrinters = () => {
      const data = getLocalData<Printer[]>('printers', []);
      setPrinters(data);
    };
    fetchPrinters();
  }, []);

  const addPrinter = async (printerData: Omit<Printer, 'id' | 'isDefault'>) => {
    if (!user) return;
    const isFirstPrinter = printers.length === 0;
    
    const newPrinter: Printer = {
        id: Date.now().toString(),
        name: printerData.name,
        connectionType: printerData.connectionType,
        address: printerData.address,
        isDefault: isFirstPrinter
    };

    const updated = [...printers, newPrinter];
    setPrinters(updated);
    setLocalData('printers', updated);
  };

  const updatePrinter = async (updatedPrinterData: Omit<Printer, 'isDefault'> & { id: string }) => {
    const updated = printers.map(p => p.id === updatedPrinterData.id ? { ...p, ...updatedPrinterData } : p);
    setPrinters(updated);
    setLocalData('printers', updated);
  };
  
  const deletePrinter = async (printerId: string) => {
    const printerToDelete = printers.find(p => p.id === printerId);
    const remainingPrinters = printers.filter(p => p.id !== printerId);
    
    if (printerToDelete?.isDefault && remainingPrinters.length > 0) {
      const updated = remainingPrinters.map((p, i) => i === 0 ? { ...p, isDefault: true } : p);
      setPrinters(updated);
      setLocalData('printers', updated);
    } else {
      setPrinters(remainingPrinters);
      setLocalData('printers', remainingPrinters);
    }
  };

  const setDefaultPrinter = async (printerId: string) => {
    const updated = printers.map(p => ({ ...p, isDefault: p.id === printerId }));
    setPrinters(updated);
    setLocalData('printers', updated);
  };

  const getDefaultPrinter = useMemo(() => () => {
    return printers.find(p => p.isDefault) || null;
  }, [printers]);

  return (
    <PrinterContext.Provider value={{ printers, addPrinter, updatePrinter, deletePrinter, setDefaultPrinter, getDefaultPrinter }}>
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinters = (): PrinterContextType => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinters must be used within a PrinterProvider');
  }
  return context;
};
