
import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import PlusIcon from '../../icons/PlusIcon';
import TrashIcon from '../../icons/TrashIcon';
import CogIcon from '../../icons/CogIcon';
import GraduationCapIcon from '../../icons/GraduationCapIcon';
import CheckIcon from '../../icons/CheckIcon';

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const SkillButton: React.FC<{ label: string; level: string; onLevelChange: (level: string) => void }> = ({ label, level, onLevelChange }) => {
    const levels = ['Nenhum', 'Básico', 'Avançado'];
    const currentIndex = levels.indexOf(level);
    const nextIndex = (currentIndex + 1) % levels.length;
    const nextLevel = levels[nextIndex];

    const levelColors: Record<string, string> = {
        'Nenhum': 'bg-slate-700/50 text-slate-400 border-slate-600',
        'Básico': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/50',
        'Avançado': 'bg-cyan-500/30 text-cyan-200 border-cyan-500',
    };

    return (
        <button
            type="button"
            onClick={() => onLevelChange(nextLevel)}
            className={`w-full p-2 rounded-lg border-2 text-center transition-all duration-200 ${levelColors[level]}`}
        >
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs font-bold">{level}</p>
        </button>
    );
};

const Step8_Skills: React.FC = () => {
    const { resumeData: { informatics, courses }, updateInformatics, addCourse, updateCourse, removeCourse } = useResume();

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Quais são suas qualificações?</h2>
                <p className="text-slate-400 mt-1">Adicione cursos, certificações e habilidades em informática.</p>
            </div>
            
            {/* Seção de Informática */}
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2"><CogIcon className="w-5 h-5 text-cyan-400"/>Informática</h3>
                    <Toggle checked={informatics.hasInformatics} onChange={(val) => updateInformatics('hasInformatics', val)} />
                </div>

                {informatics.hasInformatics && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-4 animate-[slide-in_0.3s_ease-in-out]">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <SkillButton label="Word" level={informatics.skills.word} onLevelChange={(l) => updateInformatics('skills.word', l)} />
                            <SkillButton label="Excel" level={informatics.skills.excel} onLevelChange={(l) => updateInformatics('skills.excel', l)} />
                            <SkillButton label="PowerPoint" level={informatics.skills.powerpoint} onLevelChange={(l) => updateInformatics('skills.powerpoint', l)} />
                            <SkillButton label="Access" level={informatics.skills.access} onLevelChange={(l) => updateInformatics('skills.access', l)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => updateInformatics('maintenance', !informatics.maintenance)} className={`p-3 rounded-lg border-2 text-center transition-colors text-sm font-semibold ${informatics.maintenance ? 'bg-cyan-500/30 text-cyan-200 border-cyan-500' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>Manutenção de PC</button>
                            <select value={informatics.typing} onChange={(e) => updateInformatics('typing', e.target.value)} className={`p-3 rounded-lg border-2 text-center transition-colors text-sm font-semibold ${informatics.typing !== 'Nenhum' ? 'bg-cyan-500/30 text-cyan-200 border-cyan-500' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                <option value="Nenhum">Digitação</option>
                                <option value="Básico">Digitação (Básico)</option>
                                <option value="Avançado">Digitação (Avançado)</option>
                            </select>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Instituição do Curso" value={informatics.institution} onChange={(e) => updateInformatics('institution', e.target.value)} />
                            <InputField label="Ano de Conclusão" value={informatics.conclusionYear} onChange={(e) => updateInformatics('conclusionYear', e.target.value)} />
                        </div>
                        <button type="button" onClick={() => updateInformatics('isRecent', !informatics.isRecent)} className="flex items-center gap-2 text-sm text-slate-300">
                           <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${informatics.isRecent ? 'bg-cyan-500 border-cyan-400' : 'border-slate-500'}`}>
                            {informatics.isRecent && <CheckIcon className="w-3 h-3 text-white"/>}
                           </div>
                           Curso com atualização/reciclagem recente
                        </button>
                    </div>
                )}
            </div>

            {/* Seção de Outros Cursos */}
             <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                 <h3 className="font-bold text-white flex items-center gap-2"><GraduationCapIcon className="w-5 h-5 text-cyan-400"/>Outros Cursos e Certificações</h3>
                 <div className="space-y-3 mt-4">
                    {courses.map(course => (
                        <div key={course.id} className="p-3 bg-slate-700/80 rounded-lg border border-slate-600 space-y-2 relative">
                             <button onClick={() => removeCourse(course.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <InputField label="Nome do Curso" value={course.name} onChange={(e) => updateCourse(course.id, 'name', e.target.value)} />
                                <InputField label="Instituição" value={course.institution} onChange={(e) => updateCourse(course.id, 'institution', e.target.value)} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <InputField label="Carga Horária" value={course.workload} onChange={(e) => updateCourse(course.id, 'workload', e.target.value)} placeholder="Ex: 40 horas" />
                                <InputField label="Ano de Conclusão" value={course.conclusionYear} onChange={(e) => updateCourse(course.id, 'conclusionYear', e.target.value)} placeholder="Ex: 2023"/>
                            </div>
                        </div>
                    ))}
                    <button onClick={addCourse} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 pt-2">
                        <PlusIcon className="w-5 h-5" /> Adicionar Outro Curso
                    </button>
                 </div>
             </div>
        </div>
    );
};

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">{label}</label>
        <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600"/>
    </div>
);


export default Step8_Skills;
