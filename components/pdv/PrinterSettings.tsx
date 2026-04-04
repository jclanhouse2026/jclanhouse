import React, { useState } from 'react';
import { usePrinters } from '../../context/PrinterContext';
import type { Printer } from '../../types';

// Icons
import PlusIcon from '../icons/PlusIcon';
import TrashIcon from '../icons/TrashIcon';
import PencilIcon from '../icons/PencilIcon';
import XCircleIcon from '../icons/XCircleIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

const PrinterModal: React.FC<{
    printer: Partial<Printer> | null;
    onClose: () => void;
    onSave: (printerData: Omit<Printer, 'id' | 'isDefault'> & { id?: number }) => void;
}> = ({ printer, onClose, onSave }) => {
    const [name, setName] = useState(printer?.name || '');
    const [connectionType, setConnectionType] = useState<Printer['connectionType']>(printer?.connectionType || 'usb');
    const [address, setAddress] = useState(printer?.address || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: printer?.id, name, connectionType, address });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">{printer ? 'Editar Impressora' : 'Adicionar Impressora'}</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <InputField label="Nome da Impressora" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Impressora do Caixa" required />
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Tipo de Conexão</label>
                            <select value={connectionType} onChange={e => setConnectionType(e.target.value as Printer['connectionType'])} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600">
                                <option value="usb">USB</option>
                                <option value="network">Rede</option>
                                <option value="serial">Serial</option>
                                <option value="bluetooth">Bluetooth</option>
                            </select>
                        </div>
                        <InputField label="Endereço / Caminho" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: COM3, 192.168.0.50, etc." required />
                    </div>
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 mr-2">Cancelar</button>
                        <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean }> = ({ label, value, onChange, placeholder, required }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        <input type="text" value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500" />
    </div>
);


const PrinterSettings: React.FC = () => {
    const { printers, addPrinter, updatePrinter, deletePrinter, setDefaultPrinter } = usePrinters();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);

    const openModal = (printer: Printer | null = null) => {
        setEditingPrinter(printer);
        setIsModalOpen(true);
    };

    const handleSave = (printerData: Omit<Printer, 'id' | 'isDefault'> & { id?: number }) => {
        if (printerData.id) {
            // FIX: Cast printerData to the correct type as the `if` condition ensures `id` is present.
            updatePrinter(printerData as Omit<Printer, 'isDefault'> & { id: number });
        } else {
            addPrinter(printerData);
        }
        setIsModalOpen(false);
        setEditingPrinter(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Gerenciamento de Impressoras</h3>
                <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2 text-sm">
                    <PlusIcon className="w-5 h-5" /> Adicionar Impressora
                </button>
            </div>

            <div className="space-y-3">
                {printers.length > 0 ? printers.map(printer => (
                    <div key={printer.id} className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                        <div className="flex items-center gap-4">
                            {/* FIX: Moved title prop to a wrapping span to avoid type error on SVG component. */}
                            {printer.isDefault && <span title="Impressora Padrão"><CheckCircleIcon className="w-6 h-6 text-emerald-400" /></span>}
                            <div>
                                <p className="font-bold text-white">{printer.name}</p>
                                <p className="text-xs text-slate-400">
                                    <span className="uppercase">{printer.connectionType}</span>: {printer.address}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!printer.isDefault && (
                                <button onClick={() => setDefaultPrinter(printer.id)} className="text-xs font-semibold bg-slate-600 hover:bg-slate-500 py-1 px-3 rounded-md">
                                    Definir Padrão
                                </button>
                            )}
                            <button onClick={() => openModal(printer)} className="p-2 text-slate-400 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => deletePrinter(printer.id)} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-slate-400">
                        <p>Nenhuma impressora cadastrada.</p>
                        <p className="text-sm mt-1">Clique em "Adicionar Impressora" para começar.</p>
                    </div>
                )}
            </div>

            {isModalOpen && <PrinterModal printer={editingPrinter} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default PrinterSettings;