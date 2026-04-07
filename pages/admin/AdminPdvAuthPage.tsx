
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeImage } from '../../components/SafeImage';
import KeyIcon from '../../components/icons/KeyIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import ExclamationTriangleIcon from '../../components/icons/ExclamationTriangleIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import { useAuth } from '../../context/AuthContext';
import type { User, PdvAccessStatus, UserRole } from '../../types';

type Tab = 'pending' | 'authorized' | 'revoked';

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = ({ label, value, onChange, type = 'text', required }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        <input type={type} value={value} onChange={onChange} required={required} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500" />
    </div>
);

const CreateUserModal: React.FC<{
    onClose: () => void;
    onSave: (userData: any) => Promise<void>;
}> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({ name, email, username, pass: password, role: 'moderator', pdvAccessStatus: 'authorized' });
            onClose();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao criar usuário');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">Criar Nova Conta PDV</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <InputField label="Nome Completo" value={name} onChange={e => setName(e.target.value)} required />
                        <InputField label="Nome de Usuário (login)" value={username} onChange={e => setUsername(e.target.value)} required />
                        <InputField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <InputField label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <div className="bg-cyan-500/10 p-3 rounded-md border border-cyan-500/20">
                            <p className="text-xs text-cyan-400">Esta conta será criada automaticamente como <strong>Moderador</strong> e com <strong>Acesso ao PDV Autorizado</strong>.</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 mr-2">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 disabled:bg-slate-600">
                            {isSaving ? 'Criando...' : 'Criar e Autorizar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminPdvAuthPage: React.FC = () => {
    const { adminGetAllUsers, authorizePdvAccess, revokePdvAccess, adminCreateUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const allUsers = await adminGetAllUsers();
            setUsers(allUsers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao carregar usuários.');
            console.error("Failed to fetch users:", err);
        }
        setLoading(false);
    }, [adminGetAllUsers]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        const result: { pending: User[], authorized: User[], revoked: User[] } = {
            pending: [],
            authorized: [],
            revoked: []
        };
        users.forEach(user => {
            if (user.role !== 'moderator') return; // Only show moderators on this page
            
            switch (user.pdvAccessStatus) {
                case 'authorized':
                    result.authorized.push(user);
                    break;
                case 'revoked':
                    result.revoked.push(user);
                    break;
                case 'pending':
                case 'none':
                default:
                    result.pending.push(user);
                    break;
            }
        });
        return result;
    }, [users]);
    
    const handleAuthorize = async (userId: string) => {
        await authorizePdvAccess(userId);
        fetchUsers(); // Refresh
    };
    
    const handleRevoke = async (userId: string) => {
        await revokePdvAccess(userId);
        fetchUsers(); // Refresh
    };

    const handleCreateUser = async (userData: any) => {
        await adminCreateUser(userData);
        fetchUsers();
    };

    const UserList: React.FC<{ userList: User[] }> = ({ userList }) => (
         <div className="space-y-3">
            {userList.map(user => (
                <div key={user.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                    <div className="flex items-center gap-3">
                        <SafeImage 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-xs text-slate-400">@{user.username || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        {activeTab === 'authorized' ? (
                            <button onClick={() => handleRevoke(user.id)} className="flex items-center gap-1 text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/40 py-1.5 px-3 rounded-md">
                                <XCircleIcon className="w-4 h-4"/> Revogar
                            </button>
                        ) : (
                             <button onClick={() => handleAuthorize(user.id)} className="flex items-center gap-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 py-1.5 px-3 rounded-md">
                                <CheckCircleIcon className="w-4 h-4"/> Autorizar
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {userList.length === 0 && (
                <p className="text-center text-slate-500 py-8">Nenhum usuário nesta categoria.</p>
            )}
        </div>
    );

    const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode, icon: React.ElementType, count: number }> = ({ tabId, children, icon: Icon, count }) => (
         <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabId ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
        >
            <Icon className="w-5 h-5" />
            {children}
            <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${activeTab === tabId ? 'bg-white text-cyan-600' : 'bg-slate-600 text-slate-200'}`}>{count}</span>
        </button>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <KeyIcon className="w-6 h-6" />
                    Autorizações de Acesso ao PDV
                </h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                >
                    <PlusIcon className="w-5 h-5" />
                    Criar Conta PDV
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
                        <TabButton tabId="pending" icon={ExclamationTriangleIcon} count={filteredUsers.pending.length}>Pendentes</TabButton>
                        <TabButton tabId="authorized" icon={CheckCircleIcon} count={filteredUsers.authorized.length}>Autorizados</TabButton>
                        <TabButton tabId="revoked" icon={XCircleIcon} count={filteredUsers.revoked.length}>Revogados</TabButton>
                    </div>
                </div>
                <div className="p-6">
                    {loading ? (
                        <p className="text-center text-slate-400">Carregando...</p>
                    ) : error ? (
                        <p className="text-center text-red-400">{error}</p>
                    ) : (
                        <>
                            {activeTab === 'pending' && <UserList userList={filteredUsers.pending} />}
                            {activeTab === 'authorized' && <UserList userList={filteredUsers.authorized} />}
                            {activeTab === 'revoked' && <UserList userList={filteredUsers.revoked} />}
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateUserModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleCreateUser} 
                />
            )}
        </div>
    );
};

export default AdminPdvAuthPage;
