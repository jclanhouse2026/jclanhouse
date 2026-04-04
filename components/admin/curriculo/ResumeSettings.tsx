
import React, { useState, useEffect } from 'react';
import { useResume } from '../../../context/ResumeContext';
import PlusIcon from '../../icons/PlusIcon';
import TrashIcon from '../../icons/TrashIcon';
import type { Objective } from '../../../types';
import XCircleIcon from '../../icons/XCircleIcon';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700 mb-6">
        <h3 className="font-bold text-white mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; readOnly?: boolean }> = ({ label, value, onChange, readOnly = false }) => (
    <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">{label}</label>
        <input type="text" value={value} onChange={onChange} readOnly={readOnly} className={`w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 ${readOnly ? 'text-slate-400 cursor-not-allowed' : ''}`} />
    </div>
);

const ResumeSettings: React.FC = () => {
    const { resumeConfig, updateResumeConfig } = useResume();
    const [localConfig, setLocalConfig] = useState(resumeConfig);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalConfig(resumeConfig);
    }, [resumeConfig]);
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateResumeConfig(localConfig);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error(error);
            alert("Falha ao salvar as configurações.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfigChange = (section: keyof typeof localConfig, index: number, field: string, value: string | number) => {
        const newConfig = { ...localConfig };
        const newSection = [...newConfig[section]] as any[];
        newSection[index] = { ...newSection[index], [field]: value };
        setLocalConfig({ ...newConfig, [section]: newSection });
    };

    const handleAddItem = (section: 'objectives' | 'colors') => {
        if (section === 'objectives') {
            const newObjectives = [...localConfig.objectives, { id: Date.now(), category: 'Objetivo Geral', text: 'Novo objetivo...' }];
            setLocalConfig(prev => ({ ...prev, objectives: newObjectives }));
        }
        if (section === 'colors') {
            const newColors = [...localConfig.colors, '#ffffff'];
            setLocalConfig(prev => ({...prev, colors: newColors}));
        }
    };

    const handleRemoveItem = (section: keyof typeof localConfig, index: number) => {
        const newConfig = { ...localConfig };
        const newSection = (newConfig[section] as any[]).filter((_, i) => i !== index);
        setLocalConfig({ ...newConfig, [section]: newSection });
    };
    
    const handleColorChange = (index: number, value: string) => {
        const newColors = [...localConfig.colors];
        newColors[index] = value;
        setLocalConfig(prev => ({ ...prev, colors: newColors}));
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                 <button onClick={handleSave} disabled={isSaving} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors relative disabled:bg-slate-600">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    {showSuccess && <span className="absolute -top-2 -right-2 text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5 animate-pulse">Salvo!</span>}
                </button>
            </div>
            <Section title="Objetivos Profissionais (Sugestões)">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {localConfig.objectives.map((obj, index) => (
                        <div key={obj.id} className="p-3 bg-slate-700/50 rounded-lg space-y-2 relative">
                            <button onClick={() => handleRemoveItem('objectives', index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <InputField label="Categoria" value={obj.category} onChange={e => handleConfigChange('objectives', index, 'category', e.target.value)} />
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-400 block mb-1">Texto</label>
                                    <textarea value={obj.text} onChange={e => handleConfigChange('objectives', index, 'text', e.target.value)} rows={2} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <button onClick={() => handleAddItem('objectives')} className="flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300 mt-2"><PlusIcon className="w-4 h-4"/>Adicionar Objetivo</button>
            </Section>

            <Section title="Modelos de Currículo">
                 {localConfig.templates.map((template, index) => (
                    <div key={template.id} className="p-3 bg-slate-700/50 rounded-lg flex items-end gap-2">
                        <div className="flex-grow"><InputField label="Nome do Modelo" value={template.name} onChange={e => handleConfigChange('templates', index, 'name', e.target.value)} /></div>
                        <div className="w-48"><InputField label="ID (não editável)" value={String(template.id)} onChange={() => {}} readOnly /></div>
                    </div>
                ))}
            </Section>

            <Section title="Opções de Customização">
                <h4 className="text-sm font-semibold">Cores de Destaque</h4>
                <div className="flex items-center gap-2 flex-wrap">
                    {localConfig.colors.map((color, index) => (
                        <div key={index} className="relative group">
                            <input type="color" value={color} onChange={e => handleColorChange(index, e.target.value)} className="w-8 h-8 bg-transparent border-none rounded-full cursor-pointer" style={{'--color': color} as React.CSSProperties} />
                            <button onClick={() => handleRemoveItem('colors', index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircleIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem('colors')} className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400 hover:bg-slate-600"><PlusIcon className="w-5 h-5"/></button>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-600/50">
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Tamanhos de Fonte</h4>
                        {localConfig.fontSizes.map((fs, index) => (
                             <div key={fs.id} className="p-2 bg-slate-700/50 rounded-lg flex items-end gap-2 mb-2">
                                <InputField label="Nome" value={fs.name} onChange={e => handleConfigChange('fontSizes', index, 'name', e.target.value)} />
                                <div className="w-24"><InputField label="Valor (px)" value={String(fs.id)} onChange={e => handleConfigChange('fontSizes', index, 'id', Number(e.target.value))} readOnly/></div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Espaçamentos de Linha</h4>
                        {localConfig.lineHeights.map((lh, index) => (
                             <div key={lh.id} className="p-2 bg-slate-700/50 rounded-lg flex items-end gap-2 mb-2">
                                <InputField label="Nome" value={lh.name} onChange={e => handleConfigChange('lineHeights', index, 'name', e.target.value)} />
                                <div className="w-32"><InputField label="ID" value={String(lh.id)} onChange={() => {}} readOnly/></div>
                            </div>
                        ))}
                    </div>
                 </div>
            </Section>
        </div>
    );
};

export default ResumeSettings;
