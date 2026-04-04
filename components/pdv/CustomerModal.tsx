import React, { useState } from 'react';
import type { Customer } from '../../types';

// Icon imports
import SearchIcon from '../icons/SearchIcon';
import XCircleIcon from '../icons/XCircleIcon';
import UserPlusIcon from '../icons/UserPlusIcon';

const CustomerModal: React.FC<{ 
    customers: Customer[], 
    onSelect: (customer: Customer | null) => void, 
    onAdd: (customer: { fullName: string; phone: string }) => void, 
    onClose: () => void 
}> = ({ customers, onSelect, onAdd, onClose }) => {
    const [view, setView] = useState<'search' | 'add'>('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const filteredCustomers = customers.filter(c => c.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && newPhone) {
            onAdd({ fullName: newName, phone: newPhone });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white">{view === 'search' ? 'Buscar Cliente' : 'Adicionar Novo Cliente'}</h2>
                    <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                </div>
                {view === 'search' ? (
                    <div className="p-4">
                        <div className="relative mb-3">
                            <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Buscar por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-sm"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                             <div onClick={() => onSelect(null)} className="p-2 rounded-md hover:bg-slate-700 cursor-pointer text-slate-400">
                                <p className="font-semibold">Continuar sem cadastro</p>
                            </div>
                            {filteredCustomers.map(c => (
                                <div key={c.id} onClick={() => onSelect(c)} className="p-2 rounded-md hover:bg-slate-700 cursor-pointer">
                                    <p className="font-semibold">{c.fullName}</p>
                                    <p className="text-xs text-slate-400">{c.phone}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setView('add')} className="w-full mt-3 bg-cyan-600 text-white font-bold py-2 rounded-lg hover:bg-cyan-700 flex items-center justify-center gap-2">
                            <UserPlusIcon className="w-5 h-5"/>
                            Adicionar Novo Cliente
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleAddCustomer} className="p-4">
                        <div className="space-y-4">
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome completo" className="w-full bg-slate-700 p-3 rounded-md" required/>
                            <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Telefone com DDD" className="w-full bg-slate-700 p-3 rounded-md" required/>
                        </div>
                         <div className="mt-4 flex gap-2">
                            <button type="button" onClick={() => setView('search')} className="w-1/2 bg-slate-600 font-bold py-2 rounded-lg hover:bg-slate-700">Voltar</button>
                            <button type="submit" className="w-1/2 bg-green-500 font-bold py-2 rounded-lg hover:bg-green-600">Salvar</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CustomerModal;
