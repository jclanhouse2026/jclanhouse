import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import type { Customer } from '../types';
import UserIcon from '../components/icons/UserIcon';
import UploadIcon from '../components/icons/UploadIcon';

const CustomerProfilePage: React.FC = () => {
    const { user, adminUpdateUser, refetchUser } = useAuth();
    const { customers, updateCurrentCustomer } = useCustomers();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const currentUser = customers.find(c => c.userId === user?.id);
        if (currentUser) {
            setFullName(currentUser.fullName);
            setPhone(currentUser.phone);
            setAvatarUrl(currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.fullName.replace(' ', '+')}&background=0891b2&color=fff`);
        }
        if (user) {
            setEmail(user.email || '');
            setUsername(user.username || '');
        }
    }, [customers, user]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowSuccess(false);
        if (user?.id) {
            try {
                const appliedProfileUpdates = await adminUpdateUser(user.id, {
                    name: fullName,
                    username,
                    avatarUrl
                });

                const customerUpdates: Partial<Customer> = {
                    fullName,
                    phone,
                    avatarUrl: appliedProfileUpdates.avatarUrl || avatarUrl
                };
                
                await updateCurrentCustomer(user.id, customerUpdates);
                
                await refetchUser();
                
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } catch (err) {
                 if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Ocorreu um erro ao atualizar o perfil.');
                }
            }
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserIcon className="w-6 h-6" />
                Meus Dados
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                         <div className="relative">
                            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-cyan-400 object-cover" />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-slate-600 p-1.5 rounded-full text-white hover:bg-slate-500"
                            >
                                <UploadIcon className="w-4 h-4" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                        </div>
                        <div className="flex-grow">
                             <label htmlFor="fullName" className="text-sm font-bold text-slate-300 block mb-2">Nome Completo</label>
                             <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="username" className="text-sm font-bold text-slate-300 block mb-2">Nome de Usuário (login)</label>
                            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="phone" className="text-sm font-bold text-slate-300 block mb-2">Telefone</label>
                            <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md" />
                        </div>
                    </div>

                     <div className="grid grid-cols-1">
                        <div>
                             <label htmlFor="email" className="text-sm font-bold text-slate-300 block mb-2">Email</label>
                             <input type="email" id="email" value={email} disabled className="w-full p-3 bg-slate-700/50 rounded-md text-slate-400 cursor-not-allowed" />
                        </div>
                    </div>
                </div>
                {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}
                 <div className="mt-6 text-right relative">
                    <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">
                        Salvar Alterações
                    </button>
                    {showSuccess && <span className="absolute top-1/2 -translate-y-1/2 right-full mr-4 text-xs bg-emerald-500 text-white rounded-full px-3 py-1 animate-pulse">Salvo!</span>}
                </div>
            </form>
        </div>
    );
};

export default CustomerProfilePage;