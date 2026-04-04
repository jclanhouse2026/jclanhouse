import React, { useState, useMemo } from 'react';
import { useResume } from '../../../context/ResumeContext';
import LightBulbIcon from '../../icons/LightBulbIcon';
import XCircleIcon from '../../icons/XCircleIcon';

const ObjectivesModal: React.FC<{
    onClose: () => void;
    onSelect: (text: string) => void;
}> = ({ onClose, onSelect }) => {
    const { resumeConfig } = useResume();
    const { objectives } = resumeConfig;
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const categories = useMemo(() => {
        return ['Todos', ...new Set(objectives.map(o => o.category))];
    }, [objectives]);

    const filteredObjectives = useMemo(() => {
        if (selectedCategory === 'Todos') return objectives;
        return objectives.filter(o => o.category === selectedCategory);
    }, [selectedCategory, objectives]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white">Selecione um Objetivo Profissional</h2>
                    <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="p-4 border-b border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                                    selectedCategory === category ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 overflow-y-auto flex-grow">
                    <div className="space-y-3">
                        {filteredObjectives.map((objective) => (
                            <div 
                                key={objective.id} 
                                onClick={() => onSelect(objective.text)}
                                className="bg-slate-700/50 p-3 rounded-md hover:bg-slate-700 cursor-pointer"
                            >
                                <p className="text-sm text-slate-300">{objective.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step5_Summary: React.FC = () => {
    const { resumeData, updateSummary } = useResume();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectObjective = (text: string) => {
        updateSummary(text);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Faça um resumo sobre você.</h2>
                <p className="text-slate-400 mt-1">Este é o seu "cartão de visita". Destaque suas principais qualidades e objetivos.</p>
            </div>
            
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mx-auto flex items-center gap-2 text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
                <LightBulbIcon className="w-5 h-5" />
                Gerar Sugestão de Resumo
            </button>

            <div>
                <textarea
                    value={resumeData.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    rows={8}
                    placeholder="Ex: Profissional com 5 anos de experiência em atendimento ao cliente, buscando uma oportunidade para aplicar minhas habilidades de comunicação e resolução de problemas..."
                    className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>

             {isModalOpen && (
                <ObjectivesModal
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleSelectObjective}
                />
            )}
        </div>
    );
};

export default Step5_Summary;
