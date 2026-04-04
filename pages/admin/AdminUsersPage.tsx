
import React, { useState, useEffect, useCallback } from 'react';
import UsersIcon from '../../components/icons/UsersIcon';
import KeyIcon from '../../components/icons/KeyIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import { useAuth } from '../../context/AuthContext';
import type { User, UserRole, PdvAccessStatus } from '../../types';

// --- Helper Components ---

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = ({ label, value, onChange, type = 'text', required }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        <input type={type} value={value} onChange={onChange} required={required} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500" />
    </div>
);

const UserModal: React.FC<{
    user: Partial<User> | null;
    onClose: () => void;
    onSave: (userData: Partial<User>) => Promise<void>;
}> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(user?.role || 'client');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            alert("Nome de usuário é obrigatório.");
            return;
        }
        setIsSaving(true);
        const userData: Partial<User> = { id: user?.id, name, email, username, role };
        if (password) {
            userData.password = password;
        }
        await onSave(userData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">{user ? 'Editar Usuário' : 'Criar Novo Usuário'}</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <InputField label="Nome Completo" value={name} onChange={e => setName(e.target.value)} required />
                        <InputField label="Nome de Usuário (login)" value={username} onChange={e => setUsername(e.target.value)} required />
                        <InputField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <InputField label={user ? 'Nova Senha (opcional)' : 'Senha'} type="password" value={password} onChange={e => setPassword(e.target.value)} required={!user} />
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Papel (Role)</label>
                            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600">
                                <option value="client">Cliente</option>
                                <option value="moderator">Moderador</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 mr-2">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-wait">
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Page Component ---

const AdminUsersPage: React.FC = () => {
    const { user: adminUser, adminGetAllUsers, adminUpdateUserRole, authorizePdvAccess, revokePdvAccess, adminCreateUser, adminUpdateUser, adminDeleteUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

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
    
    const openModal = (user: Partial<User> | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (userData: Partial<User>) => {
        try {
            if (userData.id) { // Editing existing user
                await adminUpdateUser(userData.id, userData);
                if (userData.role) { // Also update role if changed in modal
                    await adminUpdateUserRole(userData.id, userData.role);
                }
            } else { // Creating new user
                if (userData.name && userData.email && userData.username && userData.password) {
                    await adminCreateUser({ name: userData.name, email: userData.email, username: userData.username, pass: userData.password });
                } else {
                    throw new Error("Todos os campos são obrigatórios para criar um usuário.");
                }
            }
            setIsModalOpen(false);
            setEditingUser(null);
            await fetchUsers(); // Refresh list
        } catch(err) {
            alert(`Erro ao salvar usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema.')) {
            try {
                await adminDeleteUser(userId);
                fetchUsers();
            } catch(err) {
                 alert(`Erro ao desativar usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            }
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            await adminUpdateUserRole(userId, newRole);
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert("Falha ao atualizar o papel do usuário.");
        }
    };
    
    const getStatusBadge = (status: PdvAccessStatus = 'none') => {
        const styles = {
            pending: 'bg-amber-500/20 text-amber-400',
            authorized: 'bg-emerald-500/20 text-emerald-400',
            revoked: 'bg-red-500/20 text-red-400',
            none: 'bg-slate-600/50 text-slate-400',
        };
        const text = { pending: 'Pendente', authorized: 'Autorizado', revoked: 'Revogado', none: 'N/A' };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };

    const roles: UserRole[] = ['client', 'moderator', 'admin'];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <UsersIcon className="w-6 h-6" />
                    Gerenciamento de Usuários
                </h1>
                 <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Criar Usuário
                </button>
            </div>
            
            {error && <p className="text-red-400 bg-red-500/20 p-3 rounded-md mb-4">{error}</p>}

            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="overflow-x-auto">
                    {loading ? (
                        <p className="text-center text-slate-400">Carregando usuários...</p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-700 text-slate-400">
                                    <th className="py-3 pr-3">Usuário</th>
                                    <th className="py-3 px-3">Papel</th>
                                    <th className="py-3 px-3">Acesso PDV</th>
                                    <th className="py-3 px-3">Opções</th>
                                    <th className="py-3 pl-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-slate-700/50">
                                        <td className="py-3 pr-3">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0891b2&color=fff`} 
                                                    alt={user.name} 
                                                    className="w-9 h-9 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-400">@{user.username || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <select 
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                disabled={user.id === adminUser?.id || user.username === 'gelsonlucas'}
                                                className="bg-slate-700 border border-slate-600 rounded-md p-1.5 text-xs font-semibold focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {roles.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-3 px-3">{getStatusBadge(user.pdvAccessStatus)}</td>
                                        <td className="py-3 px-3 space-y-2">
                                            <div>
                                                <span className="text-xs text-slate-400 mr-2">Premium:</span>
                                                <ToggleSwitch enabled={user.isPremium} onChange={async enabled => { await adminUpdateUser(user.id, { isPremium: enabled }); fetchUsers(); }} />
                                            </div>
                                             <div>
                                                <span className="text-xs text-slate-400 mr-2">Faturamento:</span>
                                                <ToggleSwitch enabled={user.hasBilling} onChange={async enabled => { await adminUpdateUser(user.id, { hasBilling: enabled }); fetchUsers(); }} />
                                            </div>
                                        </td>
                                        <td className="py-3 pl-3 text-right space-x-1">
                                            {user.pdvAccessStatus !== 'authorized' ? (
                                                <button onClick={async () => { await authorizePdvAccess(user.id); fetchUsers(); }} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-500/40" title="Autorizar Acesso PDV">
                                                    <KeyIcon className="w-5 h-5"/>
                                                </button>
                                            ) : (
                                                <button onClick={async () => { await revokePdvAccess(user.id); fetchUsers(); }} className="p-2 bg-amber-500/20 text-amber-400 rounded-md hover:bg-amber-500/40" title="Revogar Acesso PDV">
                                                    <XCircleIcon className="w-5 h-5"/>
                                                </button>
                                            )}
                                            <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-white rounded-md" title="Editar Usuário"><PencilIcon className="w-5 h-5"/></button>
                                            {adminUser?.id !== user.id && (
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-md" title="Desativar Usuário"><TrashIcon className="w-5 h-5"/></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                     {users.length === 0 && !loading && (
                        <div className="text-center py-12 text-slate-400">
                            <p>Nenhum usuário encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && <UserModal user={editingUser} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />}
        </div>
    );
};

export default AdminUsersPage;
