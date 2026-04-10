import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import type { Customer, Address } from '../types';
import UserIcon from '../components/icons/UserIcon';
import UploadIcon from '../components/icons/UploadIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import { SafeImage } from '../components/SafeImage';
import { optimizeImage } from '../lib/imageUtils';

const CustomerProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, adminUpdateUser, refetchUser, uploadFile } = useAuth();

    const { customers, updateCurrentCustomer } = useCustomers();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [address, setAddress] = useState<Address>({
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        referencePoint: ''
    });
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const currentUser = customers.find(c => c.userId === user?.id);
        if (currentUser) {
            setFullName(currentUser.fullName || '');
            setPhone(currentUser.phone || '');
            const defaultAvatar = `https://ui-avatars.com/api/?name=${(currentUser.fullName || 'User').replace(' ', '+')}&background=0891b2&color=fff`;
            setAvatarUrl(currentUser.avatarUrl || currentUser.photoURL || defaultAvatar);
            setPhotoURL(currentUser.photoURL || currentUser.avatarUrl || defaultAvatar);
            if (currentUser.address) {
                setAddress({
                    cep: currentUser.address.cep || '',
                    street: currentUser.address.street || '',
                    number: currentUser.address.number || '',
                    neighborhood: currentUser.address.neighborhood || '',
                    city: currentUser.address.city || '',
                    state: currentUser.address.state || '',
                    referencePoint: currentUser.address.referencePoint || ''
                });
            }
        }
        if (user) {
            setEmail(user.email || '');
            setUsername(user.username || '');
            if (user.avatarUrl && !avatarUrl) {
                setAvatarUrl(user.avatarUrl);
            }
            if (user.photoURL && !photoURL) {
                setPhotoURL(user.photoURL);
            }
        }
    }, [customers, user]);

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/^(\d{2})(\d)/g, '($1) $2')
                .replace(/(\d)(\d{4})$/, '$1-$2');
        }
        return numbers.substring(0, 11)
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2');
    };

    const formatCep = (value: string) => {
        return value.replace(/\D/g, '').substring(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = formatCep(e.target.value);
        setAddress(prev => ({ ...prev, cep: value }));

        if (value.length === 9) {
            const cep = value.replace('-', '');
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
                        state: data.uf
                    }));
                }
            } catch (err) {
                console.error("Erro ao buscar CEP:", err);
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Check size before preview (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                setError('A imagem é muito grande. O limite é de 2MB.');
                return;
            }
            
            setError('');
            setSelectedFile(file);
            
            // Preview imediato
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
                setPhotoURL(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowSuccess(false);

        if (!address.state || !address.city || !address.street || !address.number) {
            setError('Por favor, preencha todos os campos obrigatórios do endereço.');
            return;
        }

        if (user?.id) {
            setUploading(true);
            try {
                let finalImageUrl = photoURL || avatarUrl;
                
                if (selectedFile) {
                    console.log("Iniciando otimização da imagem...");
                    const optimized = await optimizeImage(selectedFile);
                    console.log("Iniciando upload para o Storage...");
                    finalImageUrl = await uploadFile(optimized, `avatars/${user.id}_${Date.now()}.webp`);
                    console.log("Upload concluído:", finalImageUrl);
                } else if (finalImageUrl && finalImageUrl.startsWith('blob:')) {
                    console.error("URL de imagem é um blob mas nenhum arquivo foi selecionado.");
                    throw new Error("Erro no processamento da imagem. Por favor, selecione a foto novamente.");
                }

                console.log("Atualizando perfil...");
                // Sequential flow: Update Firestore (profiles)
                const appliedProfileUpdates = await adminUpdateUser(user.id, {
                    name: fullName,
                    username,
                    avatarUrl: finalImageUrl,
                    photoURL: finalImageUrl
                });

                console.log("Atualizando cliente no Firestore (customers)...");
                // Sequential flow: Update Firestore (customers)
                const customerUpdates: Partial<Customer> = {
                    fullName,
                    phone,
                    avatarUrl: appliedProfileUpdates.avatarUrl || finalImageUrl,
                    photoURL: appliedProfileUpdates.photoURL || finalImageUrl,
                    address
                };
                
                await updateCurrentCustomer(user.id, customerUpdates);
                
                console.log("Recarregando dados do usuário...");
                await refetchUser();
                setSelectedFile(null);
                setAvatarUrl(finalImageUrl);
                setPhotoURL(finalImageUrl);
                setShowSuccess(true);
                console.log("Perfil atualizado com sucesso!");
                setTimeout(() => setShowSuccess(false), 2000);
            } catch (err) {
                 if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Ocorreu um erro ao atualizar o perfil.');
                }
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-cyan-400" />
                    Meus Dados
                </h2>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Voltar
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    {/* Perfil e Nome */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-700/30 p-4 rounded-lg">
                         <div className="relative group">
                            <SafeImage src={photoURL || avatarUrl} alt={fullName || 'Avatar'} className="w-28 h-28 rounded-full border-4 border-slate-700 object-cover shadow-xl group-hover:border-cyan-500 transition-colors" />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full text-white hover:bg-cyan-500 shadow-lg transform hover:scale-110 transition-all disabled:opacity-50"
                                title="Alterar foto"
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <UploadIcon className="w-4 h-4" />
                                )}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                        </div>
                        <div className="flex-grow w-full">
                             <label htmlFor="fullName" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Nome Completo</label>
                             <input 
                                type="text" 
                                id="fullName" 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)} 
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                placeholder="Seu nome completo"
                             />
                        </div>
                    </div>

                    {/* Contato e Login */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="username" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Nome de Usuário (login)</label>
                            <input 
                                type="text" 
                                id="username" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                placeholder="Ex: joao_silva"
                            />
                        </div>
                         <div>
                            <label htmlFor="phone" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-cyan-400" />
                                Telefone
                            </label>
                            <input 
                                type="tel" 
                                id="phone" 
                                value={phone} 
                                onChange={e => setPhone(formatPhone(e.target.value))} 
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                placeholder="(00) 0 0000-0000"
                            />
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4 border-t border-slate-700 pt-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPinIcon className="w-5 h-5 text-cyan-400" />
                            Endereço de Entrega
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="cep" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">CEP</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="cep" 
                                        value={address.cep} 
                                        onChange={handleCepChange} 
                                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                        placeholder="00000-000"
                                    />
                                    {loadingCep && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="street" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Rua *</label>
                                <input 
                                    type="text" 
                                    id="street" 
                                    value={address.street} 
                                    onChange={e => setAddress(prev => ({ ...prev, street: e.target.value }))} 
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                    placeholder="Nome da rua/avenida"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="number" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Número *</label>
                                <input 
                                    type="text" 
                                    id="number" 
                                    value={address.number} 
                                    onChange={e => setAddress(prev => ({ ...prev, number: e.target.value }))} 
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                    placeholder="Nº"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="neighborhood" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Bairro</label>
                                <input 
                                    type="text" 
                                    id="neighborhood" 
                                    value={address.neighborhood} 
                                    onChange={e => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))} 
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                    placeholder="Bairro"
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Cidade *</label>
                                <input 
                                    type="text" 
                                    id="city" 
                                    value={address.city} 
                                    onChange={e => setAddress(prev => ({ ...prev, city: e.target.value }))} 
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                    placeholder="Cidade"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="state" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Estado *</label>
                                <input 
                                    type="text" 
                                    id="state" 
                                    value={address.state} 
                                    onChange={e => setAddress(prev => ({ ...prev, state: e.target.value.toUpperCase().substring(0, 2) }))} 
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                    placeholder="UF"
                                    maxLength={2}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="referencePoint" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Ponto de Referência *</label>
                                <input 
                                    type="text" 
                                    id="referencePoint" 
                                    value={address.referencePoint} 
                                    onChange={e => setAddress(prev => ({ ...prev, referencePoint: e.target.value }))} 
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
                                    placeholder="Ex: Próximo à padaria"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 border-t border-slate-700 pt-6">
                        <div>
                             <label htmlFor="email" className="text-sm font-bold text-slate-300 block mb-2 uppercase tracking-wider">Email (não alterável)</label>
                             <input type="email" id="email" value={email} disabled className="w-full p-3 bg-slate-700/30 border border-slate-700 rounded-md text-slate-500 cursor-not-allowed" />
                        </div>
                    </div>
                </div>
                {error && <p className="text-sm text-red-400 text-center mt-6 bg-red-400/10 p-3 rounded-md border border-red-400/20">{error}</p>}
                 <div className="mt-8 flex items-center justify-end gap-4 relative">
                    {showSuccess && <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        Dados salvos com sucesso!
                    </span>}
                    <button 
                        type="submit" 
                        className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-cyan-500 transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={uploading}
                    >
                        {uploading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerProfilePage;
