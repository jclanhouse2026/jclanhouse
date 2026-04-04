import React from 'react';
import { useResume } from '../../context/ResumeContext';

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string }> = ({ label, name, value, onChange, type = 'text', placeholder }) => (
    <div>
        <label className="text-sm font-semibold text-slate-300 block mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
    </div>
);

const Step3_Location: React.FC = () => {
    const { resumeData, updateProfile, updateAddress } = useResume();

    return (
        <div className="space-y-6">
             <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Onde você mora?</h2>
                <p className="text-slate-400 mt-1">Essas informações ajudam a personalizar seu currículo.</p>
            </div>
            {/* FIX: Replaced single address field with multiple fields for each address property. */}
            <InputField label="Endereço (Rua, Nº, Bairro)" name="street" value={resumeData.profile.address.street} onChange={(e) => updateAddress('street', e.target.value)} placeholder="Rua ABC, 123, Centro" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Cidade Natal" name="birthPlace" value={resumeData.profile.birthPlace} onChange={e => updateProfile('birthPlace', e.target.value)} placeholder="Cidade, Estado" />
                <InputField label="Data de Nascimento" name="dob" value={resumeData.profile.dob} onChange={e => updateProfile('dob', e.target.value)} type="date" />
            </div>
        </div>
    );
};

export default Step3_Location;