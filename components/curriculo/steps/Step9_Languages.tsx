
import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import PlusIcon from '../../icons/PlusIcon';
import TrashIcon from '../../icons/TrashIcon';

const predefinedLanguages = ['Português', 'Inglês', 'Espanhol', 'Francês'];
const levels = ['Nenhum', 'Básico', 'Intermediário', 'Avançado', 'Nativo'];

const Step9_Languages: React.FC = () => {
    const { resumeData, setOrUpdateLanguage, addLanguage, updateLanguage, removeLanguage } = useResume();

    const handlePredefinedLevelChange = (name: string, level: string) => {
        setOrUpdateLanguage({ name, level });
    };

    const customLanguages = resumeData.languages.filter(
        lang => !predefinedLanguages.includes(lang.name)
    );

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Você fala outros idiomas?</h2>
                <p className="text-slate-400 mt-1">Isso pode ser um grande diferencial no seu currículo.</p>
            </div>
            
            {/* Idiomas Principais */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-300">Idiomas Principais</h3>
                {predefinedLanguages.map(langName => {
                    const currentLang = resumeData.languages.find(l => l.name === langName);
                    const currentLevel = currentLang?.level || 'Nenhum';

                    return (
                        <div key={langName} className="bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                            <p className="font-bold text-white mb-2">{langName}</p>
                            <div className="flex flex-wrap gap-2">
                                {levels.map(level => {
                                    const isSelected = currentLevel === level;
                                    const isNone = level === 'Nenhum';
                                    return (
                                        <button 
                                            key={level}
                                            type="button"
                                            onClick={() => handlePredefinedLevelChange(langName, level)}
                                            className={`flex-1 text-xs font-semibold py-2 px-2 rounded-md transition-all duration-200 border-2 ${
                                                isSelected 
                                                    ? (isNone ? 'bg-slate-600 border-slate-500 text-white' : 'bg-cyan-500/20 border-cyan-500 text-cyan-200')
                                                    : 'bg-slate-700/50 border-transparent text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Outros Idiomas */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-300">Outros Idiomas</h3>
                {customLanguages.map(lang => (
                    <div key={lang.id} className="p-3 bg-slate-700/50 rounded-lg grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-end border border-slate-700">
                        <div>
                            <label className="text-xs text-slate-400">Idioma</label>
                            <input type="text" value={lang.name} onChange={e => updateLanguage(lang.id, 'name', e.target.value)} placeholder="Ex: Alemão" className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600"/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400">Nível</label>
                            <select value={lang.level} onChange={e => updateLanguage(lang.id, 'level', e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600">
                                <option>Básico</option>
                                <option>Intermediário</option>
                                <option>Avançado</option>
                                <option>Nativo</option>
                            </select>
                        </div>
                        <button onClick={() => removeLanguage(lang.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-700 rounded-md h-10"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                ))}
                 <button onClick={addLanguage} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 mx-auto pt-2">
                    <PlusIcon className="w-5 h-5" />Adicionar Outro Idioma
                </button>
            </div>
        </div>
    );
};

export default Step9_Languages;
