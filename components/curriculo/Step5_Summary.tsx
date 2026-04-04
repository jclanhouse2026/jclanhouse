
import React from 'react';
import { useResume } from '../../context/ResumeContext';

const Step5_Summary: React.FC = () => {
    const { resumeData, updateSummary } = useResume();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Faça um resumo sobre você.</h2>
                <p className="text-slate-400 mt-1">Este é o seu "cartão de visita". Destaque suas principais qualidades e objetivos.</p>
            </div>
            <textarea
                value={resumeData.summary}
                onChange={(e) => updateSummary(e.target.value)}
                rows={8}
                placeholder="Ex: Profissional com 5 anos de experiência em atendimento ao cliente, buscando uma oportunidade para aplicar minhas habilidades de comunicação e resolução de problemas..."
                className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        </div>
    );
};

export default Step5_Summary;
