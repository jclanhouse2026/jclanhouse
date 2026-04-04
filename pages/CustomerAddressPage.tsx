
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import type { Address } from '../types';
import MapPinIcon from '../components/icons/MapPinIcon';

const emptyAddress: Address = { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' };

const InputField: React.FC<{label: string; name: keyof Address; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; disabled?: boolean; readOnly?: boolean; maxLength?: number; refProp?: React.Ref<HTMLInputElement> }> = ({ label, name, value, onChange, placeholder, onBlur, disabled, readOnly, maxLength, refProp }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            ref={refProp}
            className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none disabled:bg-slate-700/50 disabled:cursor-not-allowed"
        />
    </div>
);


const CustomerAddressPage: React.FC = () => {
    const { user } = useAuth();
    const { customers, updateCurrentCustomer } = useCustomers();
    
    const [address, setAddress] = useState<Address>(emptyAddress);
    const [loadingCep, setLoadingCep] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const numberInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        const currentUser = customers.find(c => c.userId === user?.id);
        if (currentUser && currentUser.address) {
            setAddress(currentUser.address);
        }
    }, [customers, user]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'cep') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
        }
        setAddress(prev => ({ ...prev, [name]: formattedValue }));
    };

     const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setAddress(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                }));
                numberInputRef.current?.focus();
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setLoadingCep(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user?.id) {
            updateCurrentCustomer(user.id, { address: { ...address, cep: address.cep.replace(/\D/g, '')} });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MapPinIcon className="w-6 h-6" />
                Meu Endereço
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 relative">
                            <InputField label="CEP" name="cep" value={address.cep} onChange={handleAddressChange} placeholder="00000-000" onBlur={handleCepBlur} maxLength={9} />
                            {loadingCep && <div className="absolute top-9 right-3 h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        <InputField label="Estado" name="state" value={address.state} onChange={() => {}} placeholder="Estado" readOnly disabled />
                        <InputField label="Cidade" name="city" value={address.city} onChange={() => {}} placeholder="Cidade" readOnly disabled />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2"><InputField label="Rua / Logradouro" name="street" value={address.street} onChange={handleAddressChange} placeholder="Sua rua" /></div>
                        <InputField label="Número" name="number" value={address.number} onChange={handleAddressChange} placeholder="Nº" refProp={numberInputRef}/>
                    </div>

                     <InputField label="Bairro" name="neighborhood" value={address.neighborhood} onChange={handleAddressChange} placeholder="Seu bairro" />
                </div>
                 <div className="mt-6 text-right relative">
                    <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">
                        Salvar Endereço
                    </button>
                    {showSuccess && <span className="absolute top-1/2 -translate-y-1/2 right-full mr-4 text-xs bg-emerald-500 text-white rounded-full px-3 py-1 animate-pulse">Salvo!</span>}
                </div>
            </form>
        </div>
    );
};

export default CustomerAddressPage;
