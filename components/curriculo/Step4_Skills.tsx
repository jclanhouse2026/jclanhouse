import React from 'react';
import { useResume } from '../../context/ResumeContext';

const Step4_Details: React.FC = () => {
    const { resumeData, updateProfile, updateCnh } = useResume();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                updateProfile('photo', event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const cnhCategories = ['Não possui', 'A', 'B', 'AB', 'C', 'D', 'E'];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Ótimo! Agora, alguns detalhes finais.</h2>
                <p className="text-slate-400 mt-1">Adicione uma foto profissional para se destacar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-300 block mb-1">Possui CNH?</label>
                    {/* FIX: Replaced text input with buttons for CNH category selection to fix type error and improve UX. */}
                    <div className="flex flex-wrap gap-2">
                        {cnhCategories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => updateCnh('category', cat as any)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                    resumeData.profile.cnh.category === cat ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {resumeData.profile.cnh.category !== 'Não possui' && (
                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Exerce Atividade Remunerada (EAR)?</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateCnh('ear', true)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                        resumeData.profile.cnh.ear ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                >
                                    Sim
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateCnh('ear', false)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                        !resumeData.profile.cnh.ear ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                >
                                    Não
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                 <div className="flex flex-col items-center">
                    <label className="text-sm font-semibold text-slate-300 block mb-2">Sua Foto de Perfil</label>
                    <div className="relative">
                        <img src={resumeData.profile.photo || `https://ui-avatars.com/api/?name=${resumeData.profile.name || '?'}&background=0d9488&color=fff&size=128`} alt="Foto de Perfil" className="w-28 h-28 rounded-full object-cover border-4 border-slate-600" />
                        <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-slate-600 p-2 rounded-full cursor-pointer hover:bg-slate-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 6.732z" /></svg>
                           <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step4_Details;