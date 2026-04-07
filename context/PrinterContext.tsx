import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import type { Printer } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from '../lib/localDb';

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
    const fetchPrinters = async () => {
      if (!user) {
        setPrinters([]);
        return;
      }
      try {
        const q = query(collection(db, 'printers'), where('user_id', '==', user.id));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            connectionType: doc.data().connection_type,
            address: doc.data().address,
            isDefault: doc.data().is_default
        } as Printer));
        setPrinters(data);
      } catch (error) {
        console.error("Erro ao buscar impressoras:", (error as Error).message);
      }
    };
    fetchPrinters();
  }, [user]);

  const addPrinter = async (printerData: Omit<Printer, 'id' | 'isDefault'>) => {
    if (!user) return;
    const isFirstPrinter = printers.length === 0;
    
    const newPrinter = {
        name: printerData.name,
        connection_type: printerData.connectionType,
        address: printerData.address,
        user_id: user.id,
        is_default: isFirstPrinter
    };

    const docRef = await addDoc(collection(db, 'printers'), newPrinter);
    
    setPrinters(prev => [...prev, {
        id: docRef.id,
        name: newPrinter.name,
        connectionType: newPrinter.connection_type as any,
        address: newPrinter.address,
        isDefault: newPrinter.is_default
    }]);
  };

  const updatePrinter = async (updatedPrinterData: Omit<Printer, 'isDefault'> & { id: string }) => {
    const { id, ...rest } = updatedPrinterData;
    await updateDoc(doc(db, 'printers', id), {
        name: rest.name,
        connection_type: rest.connectionType,
        address: rest.address
    });
    setPrinters(prev => prev.map(p => (p.id === id ? { ...p, ...rest } : p)));
  };
  
  const deletePrinter = async (printerId: string) => {
    const printerToDelete = printers.find(p => p.id === printerId);
    await deleteDoc(doc(db, 'printers', printerId));

    const remainingPrinters = printers.filter(p => p.id !== printerId);
    if (printerToDelete?.isDefault && remainingPrinters.length > 0) {
      await setDefaultPrinter(remainingPrinters[0].id);
    } else {
      setPrinters(remainingPrinters);
    }
  };

  const setDefaultPrinter = async (printerId: string) => {
    if (!user) return;
    
    const batch = writeBatch(db);
    
    printers.forEach(p => {
        const pRef = doc(db, 'printers', p.id);
        batch.update(pRef, { is_default: p.id === printerId });
    });
    
    await batch.commit();

    setPrinters(prev => prev.map(p => ({ ...p, isDefault: p.id === printerId })));
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
