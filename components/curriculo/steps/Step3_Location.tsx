
import React, { useState, useRef } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { useCustomers } from '../../../context/CustomerContext';
import { useAuth } from '../../../context/AuthContext';
import MapPinIcon from '../../icons/MapPinIcon';

const InputField: React.FC<{ label: string; name: any; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; disabled?: boolean; readOnly?: boolean; maxLength?: number; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; refProp?: React.Ref<HTMLInputElement> }> = ({ label, name, value, onChange, type = 'text', placeholder, disabled, readOnly, maxLength, onBlur, refProp }) => (
    <div>
        <label className="text-sm font-semibold text-slate-300 block mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            onBlur={onBlur}
            ref={refProp}
            className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-700/50 disabled:cursor-not-allowed"
        />
    </div>
);


const Step3_Location: React.FC = () => {
    const { resumeData, updateProfile, updateAddress, importProfileData } = useResume();
    const { customersForCurrentUser } = useCustomers();
    const { user } = useAuth();
    const [loadingCep, setLoadingCep] = useState(false);
    const numberInputRef = useRef<HTMLInputElement>(null);

    const handleImport = () => {
        if (customersForCurrentUser.length > 0) {
            importProfileData(customersForCurrentUser[0]);
        }
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        updateAddress('cep', value);
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                updateAddress('street', data.logradouro);
                updateAddress('neighborhood', data.bairro);
                updateAddress('city', data.localidade);
                updateAddress('state', data.uf);
                numberInputRef.current?.focus();
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setLoadingCep(false);
        }
    };

    return (
        <div className="space-y-6">
             <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Onde você mora?</h2>
                <p className="text-slate-400 mt-1">Essas informações ajudam a personalizar seu currículo.</p>
            </div>

            {user && customersForCurrentUser.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <MapPinIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Usar endereço do meu perfil?</p>
                            <p className="text-xs text-slate-400">Puxar CEP, rua, bairro e cidade automaticamente.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleImport}
                        className="text-xs font-bold bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        Importar Endereço
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 relative">
                    <InputField label="CEP" name="cep" value={(resumeData.profile.address.cep || '').replace(/(\d{5})(\d)/, '$1-$2')} onChange={handleCepChange} onBlur={handleCepBlur} placeholder="00000-000" maxLength={9} />
                    {loadingCep && <div className="absolute top-9 right-3 h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                <InputField label="Estado" name="state" value={resumeData.profile.address.state} onChange={() => {}} placeholder="Estado" readOnly disabled />
                <InputField label="Cidade" name="city" value={resumeData.profile.address.city} onChange={() => {}} placeholder="Cidade" readOnly disabled />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <InputField label="Rua / Logradouro" name="street" value={resumeData.profile.address.street} onChange={(e) => updateAddress('street', e.target.value)} placeholder="Sua rua" />
                </div>
                <InputField label="Número" name="number" value={resumeData.profile.address.number} onChange={(e) => updateAddress('number', e.target.value)} placeholder="Nº" refProp={numberInputRef}/>
            </div>

             <InputField label="Bairro" name="neighborhood" value={resumeData.profile.address.neighborhood} onChange={(e) => updateAddress('neighborhood', e.target.value)} placeholder="Seu bairro" />

             <hr className="border-slate-700"/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">Cidade Natal</label>
                    <input type="text" name="birthPlace" value={resumeData.profile.birthPlace} onChange={(e) => updateProfile('birthPlace', e.target.value)} placeholder="Cidade, Estado" className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600"/>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-1">Data de Nascimento</label>
                    <input type="date" name="dob" value={resumeData.profile.dob} onChange={(e) => updateProfile('dob', e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600"/>
                </div>
            </div>
        </div>
    );
};

export default Step3_Location;
