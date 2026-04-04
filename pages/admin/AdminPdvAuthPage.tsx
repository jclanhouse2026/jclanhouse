
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import KeyIcon from '../../components/icons/KeyIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import ExclamationTriangleIcon from '../../components/icons/ExclamationTriangleIcon';
import { useAuth } from '../../context/AuthContext';
import type { User, PdvAccessStatus } from '../../types';

type Tab = 'pending' | 'authorized' | 'revoked';

const AdminPdvAuthPage: React.FC = () => {
    const { adminGetAllUsers, authorizePdvAccess, revokePdvAccess } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('pending');

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

    const UserList: React.FC<{ userList: User[] }> = ({ userList }) => (
         <div className="space-y-3">
            {userList.map(user => (
                <div key={user.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                    <div className="flex items-center gap-3">
                        <img 
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0891b2&color=fff`} 
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
            <h1 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                <KeyIcon className="w-6 h-6" />
                Autorizações de Acesso ao PDV
            </h1>
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <div className="flex space-x-2">
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
        </div>
    );
};

export default AdminPdvAuthPage;
