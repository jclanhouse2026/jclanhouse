
import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import PlusIcon from '../../icons/PlusIcon';
import TrashIcon from '../../icons/TrashIcon';
import AutocompleteInput from '../AutocompleteInput';

const Step6_Experience: React.FC = () => {
    const { resumeData, addExperience, updateExperience, removeExperience } = useResume();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Conte sobre suas experiências.</h2>
                <p className="text-slate-400 mt-1">Liste seus empregos anteriores, começando pelo mais recente.</p>
            </div>
            
            {resumeData.experiences.length > 0 && (
                <div className="space-y-4">
                    {resumeData.experiences.map((exp) => (
                        <div key={exp.id} className="p-4 bg-slate-700/50 rounded-lg space-y-3 border border-slate-600 relative">
                            <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 block mb-1">Cargo</label>
                                    <AutocompleteInput 
                                        type="role"
                                        value={exp.role}
                                        onChange={val => updateExperience(exp.id, 'role', val)}
                                        placeholder="Ex: Vendedor"
                                        className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 block mb-1">Empresa</label>
                                    <AutocompleteInput 
                                        type="company"
                                        value={exp.company}
                                        onChange={val => updateExperience(exp.id, 'company', val)}
                                        placeholder="Ex: Loja ABC"
                                        className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white"
                                    />
                                </div>
                            </div>
                            <InputField label="Período" value={exp.period} onChange={e => updateExperience(exp.id, 'period', e.target.value)} placeholder="Ex: Jan 2020 - Dez 2022" />
                            
                            <div className="relative">
                                <TextAreaField label="Descrição das Atividades" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button 
                onClick={addExperience} 
                className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 mx-auto"
            >
                <PlusIcon className="w-5 h-5" />
                Adicionar Experiência
            </button>
        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">{label}</label>
        <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white"/>
    </div>
);

const TextAreaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">{label}</label>
        <textarea value={value} onChange={onChange} rows={3} placeholder="Descreva suas principais responsabilidades..." className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white"/>
    </div>
);

export default Step6_Experience;
