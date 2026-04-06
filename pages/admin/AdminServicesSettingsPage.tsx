
import React, { useState } from 'react';
import { useServiceSettings } from '../../context/ServiceSettingsContext';
import { iconOptions } from '../../components/IconMap';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import AdjustmentsVerticalIcon from '../../components/icons/AdjustmentsVerticalIcon';
import type { ServiceSetting } from '../../types';

const InputField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; }> = ({ label, value, onChange, type = 'text' }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-1">{label}</label>
        {type === 'textarea' ? (
             <textarea value={value} onChange={onChange} rows={3} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600"/>
        ) : (
            <input type={type} value={value} onChange={onChange} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600"/>
        )}
    </div>
);

const SelectField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string; label: string}[]}> = ({label, value, onChange, options}) => (
     <div>
        <label className="text-sm font-bold text-slate-300 block mb-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 capitalize">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const AdminServicesSettingsPage: React.FC = () => {
    const { serviceSettings, updateServiceSettings } = useServiceSettings();
    const [localSettings, setLocalSettings] = useState<ServiceSetting[]>(serviceSettings);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        updateServiceSettings(localSettings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleChange = (index: number, field: keyof ServiceSetting, value: string) => {
        const newSettings = [...localSettings];
        (newSettings[index] as any)[field] = value;
        setLocalSettings(newSettings);
    };

    const addItem = () => {
        const newItem: ServiceSetting = {
            id: Date.now().toString(),
            icon: 'BriefcaseIcon',
            title: 'Novo Serviço',
            description: 'Descrição do novo serviço.',
            link: '#'
        };
        setLocalSettings(prev => [...prev, newItem]);
    };
    
    const removeItem = (id: string) => {
        setLocalSettings(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <AdjustmentsVerticalIcon className="w-6 h-6" />
                    Configurações da Página de Serviços
                </h1>
                <button onClick={handleSave} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors relative">
                    Salvar Alterações
                    {showSuccess && <span className="absolute -top-2 -right-2 text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5">Salvo!</span>}
                </button>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
                {localSettings.map((service, index) => (
                    <div key={service.id} className="bg-slate-700/50 p-4 rounded-lg flex flex-col md:flex-row gap-4">
                        <div className="flex-grow space-y-3">
                            <InputField label="Título" value={service.title} onChange={e => handleChange(index, 'title', e.target.value)} />
                            <InputField label="Descrição" type="textarea" value={service.description} onChange={e => handleChange(index, 'description', e.target.value)} />
                        </div>
                        <div className="flex-shrink-0 w-full md:w-48 space-y-3">
                            <SelectField label="Ícone" value={service.icon} onChange={e => handleChange(index, 'icon', e.target.value)} options={iconOptions} />
                            <InputField label="Link de Destino" value={service.link} onChange={e => handleChange(index, 'link', e.target.value)} />
                        </div>
                         <div className="flex-shrink-0 flex items-center justify-center">
                            <button onClick={() => removeItem(service.id)} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 h-10 w-10">
                                <TrashIcon className="w-5 h-5 mx-auto"/>
                            </button>
                        </div>
                    </div>
                ))}
                <button onClick={addItem} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 pt-4">
                    <PlusIcon className="w-4 h-4" />
                    Adicionar Novo Serviço
                </button>
            </div>
        </div>
    );
};

export default AdminServicesSettingsPage;
