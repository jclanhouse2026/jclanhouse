
import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import PlusIcon from '../../icons/PlusIcon';
import TrashIcon from '../../icons/TrashIcon';
import AutocompleteInput from '../AutocompleteInput';

const educationLevels = {
    'Ensino Fundamental': { statuses: ['Incompleto', 'Cursando', 'Completo'], grades: Array.from({ length: 9 }, (_, i) => `${i + 1}º Ano`) },
    'Ensino Médio': { statuses: ['Incompleto', 'Cursando', 'Completo'], grades: Array.from({ length: 3 }, (_, i) => `${i + 1}º Ano`) },
    'Técnico': { statuses: ['Incompleto', 'Cursando', 'Completo'], grades: Array.from({ length: 4 }, (_, i) => `${i + 1}º Módulo`) },
    'Graduação': { statuses: ['Incompleto', 'Cursando', 'Completo'], grades: Array.from({ length: 10 }, (_, i) => `${i + 1}º Período`) },
    'Pós-graduação': { statuses: ['Incompleto', 'Cursando', 'Completo'], grades: [] },
    'Mestrado': { statuses: ['Incompleto', 'Cursando', 'Completo'], grades: [] },
    'Doutorado': { statuses: ['Incompleto', 'Cursando', 'Completo'], grades: [] },
};

type EducationLevel = keyof typeof educationLevels;

const EducationItem: React.FC<{ edu: ReturnType<typeof useResume>['resumeData']['education'][0] }> = ({ edu }) => {
    const { updateEducation, removeEducation, resumeData } = useResume();

    const [level, status, grade] = (edu.degree || '').split(' - ').map(s => s.trim());

    const handleDegreeChange = (newLevel?: string, newStatus?: string, newGrade?: string) => {
        const finalLevel = newLevel || level || 'Ensino Médio';
        const finalStatus = newStatus || status || 'Completo';
        const finalGrade = newGrade || (newStatus === 'Completo' || newStatus === 'Incompleto' ? '' : grade); // Clear grade if complete/incomplete

        let degreeString = `${finalLevel} - ${finalStatus}`;
        if (finalGrade && (finalStatus === 'Cursando' || finalStatus === 'Incompleto')) {
            degreeString += ` - ${finalGrade}`;
        }
        updateEducation(edu.id, 'degree', degreeString);
    };

    const currentLevelData = educationLevels[level as EducationLevel];

    return (
        <div className="p-4 bg-slate-700/50 rounded-lg space-y-3 border border-slate-600 relative">
            <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400">
                <TrashIcon className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Instituição de Ensino</label>
                    <AutocompleteInput 
                        type="school"
                        value={edu.institution}
                        onChange={val => updateEducation(edu.id, 'institution', val)}
                        state={resumeData.profile.address.state}
                        city={resumeData.profile.address.city}
                        placeholder="Ex: Escola Estadual ABC"
                        className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white"
                    />
                </div>
                <InputField label="Período" value={edu.period} onChange={e => updateEducation(edu.id, 'period', e.target.value)} placeholder="Ex: 2018 - 2020" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SelectField label="Nível" value={level || ''} onChange={e => handleDegreeChange(e.target.value, undefined, '')}>
                    <option value="">Selecione...</option>
                    {Object.keys(educationLevels).map(l => <option key={l} value={l}>{l}</option>)}
                </SelectField>
                {level && currentLevelData && (
                     <SelectField label="Status" value={status || ''} onChange={e => handleDegreeChange(undefined, e.target.value, undefined)}>
                        <option value="">Selecione...</option>
                        {currentLevelData.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectField>
                )}
                {(status === 'Cursando' || status === 'Incompleto') && currentLevelData?.grades.length > 0 && (
                     <SelectField label="Série/Período" value={grade || ''} onChange={e => handleDegreeChange(undefined, undefined, e.target.value)}>
                        <option value="">Selecione...</option>
                        {currentLevelData.grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </SelectField>
                )}
            </div>
        </div>
    );
}

const Step7_Education: React.FC = () => {
    const { resumeData, addEducation } = useResume();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Qual é a sua formação?</h2>
                <p className="text-slate-400 mt-1">Adicione suas formações, da mais recente para a mais antiga.</p>
            </div>
            
            {resumeData.education.length > 0 && (
                <div className="space-y-4">
                    {resumeData.education.map((edu) => <EducationItem key={edu.id} edu={edu} />)}
                </div>
            )}

            <button onClick={addEducation} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 mx-auto">
                <PlusIcon className="w-5 h-5" />
                Adicionar Formação
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

const SelectField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ label, value, onChange, children }) => (
    <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white">
            {children}
        </select>
    </div>
);

export default Step7_Education;
