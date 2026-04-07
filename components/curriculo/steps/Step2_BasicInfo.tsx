
import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { useCustomers } from '../../../context/CustomerContext';
import { useAuth } from '../../../context/AuthContext';
import UserIcon from '../../icons/UserIcon';

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
    const { resumeData, updateProfile, importProfileData } = useResume();
    const { customersForCurrentUser } = useCustomers();
    const { user } = useAuth();

    const handleImport = () => {
        if (customersForCurrentUser.length > 0) {
            importProfileData(customersForCurrentUser[0]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Para começar, suas informações básicas.</h2>
                <p className="text-slate-400 mt-1">Como os recrutadores entrarão em contato?</p>
            </div>

            {user && customersForCurrentUser.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <UserIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Usar dados do meu perfil?</p>
                            <p className="text-xs text-slate-400">Puxar nome, e-mail e telefone automaticamente.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleImport}
                        className="text-xs font-bold bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        Importar Meus Dados
                    </button>
                </div>
            )}

            <InputField label="Nome Completo" name="name" value={resumeData.profile.name} onChange={updateProfile} placeholder="Seu nome completo" />
            <InputField label="E-mail" name="email" value={resumeData.profile.email} onChange={updateProfile} type="email" placeholder="seu.email@exemplo.com" />
            <InputField label="Telefone" name="phone" value={resumeData.profile.phone} onChange={updateProfile} placeholder="(XX) XXXXX-XXXX" />
        </div>
    );
};

export default Step2_BasicInfo;
