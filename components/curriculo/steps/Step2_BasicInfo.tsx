
import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const InputField: React.FC<{ label: string; name: keyof ReturnType<typeof useResume>['resumeData']['profile']; value: string; onChange: (name: any, value: string) => void; type?: string; placeholder?: string }> = ({ label, name, value, onChange, type = 'text', placeholder }) => (
    <div>
        <label className="text-sm font-semibold text-slate-300 block mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
    </div>
);

const Step2_BasicInfo: React.FC = () => {
    const { resumeData, updateProfile } = useResume();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Para começar, suas informações básicas.</h2>
                <p className="text-slate-400 mt-1">Como os recrutadores entrarão em contato?</p>
            </div>
            <InputField label="Nome Completo" name="name" value={resumeData.profile.name} onChange={updateProfile} placeholder="Seu nome completo" />
            <InputField label="E-mail" name="email" value={resumeData.profile.email} onChange={updateProfile} type="email" placeholder="seu.email@exemplo.com" />
            <InputField label="Telefone" name="phone" value={resumeData.profile.phone} onChange={updateProfile} placeholder="(XX) XXXXX-XXXX" />
        </div>
    );
};

export default Step2_BasicInfo;
