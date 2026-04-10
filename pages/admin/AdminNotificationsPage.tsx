import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { User } from '../../types';
import BellIcon from '../../components/icons/BellIcon';
import SendIcon from '../../components/icons/SendIcon';
import UsersIcon from '../../components/icons/UsersIcon';
import UserIcon from '../../components/icons/UserIcon';
import InfoIcon from '../../components/icons/InfoIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import ExclamationTriangleIcon from '../../components/icons/ExclamationTriangleIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';

const AdminNotificationsPage: React.FC = () => {
  const { addNotification, sendNotificationToAll } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    if (targetType === 'specific' && !selectedUserId) return;

    setSending(true);
    try {
      if (targetType === 'all') {
        await sendNotificationToAll(title, message, type);
      } else {
        await addNotification(selectedUserId, title, message, type);
      }
      
      setSuccess(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BellIcon className="w-8 h-8 text-cyan-400" />
          Gerenciar Notificações
        </h1>
        <p className="text-slate-400 mt-2">Envie alertas e mensagens para seus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <SendIcon className="w-5 h-5 text-cyan-400" />
              Nova Notificação
            </h2>

            <form onSubmit={handleSend} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Destinatário</label>
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setTargetType('all')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        targetType === 'all' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UsersIcon className="w-4 h-4" />
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('specific')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        targetType === 'specific' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      Específico
                    </button>
                  </div>
                </div>

                {targetType === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Selecionar Usuário</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      disabled={loadingUsers}
                    >
                      <option value="">Selecione um usuário...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tipo de Alerta</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'info', label: 'Informativo', icon: InfoIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                    { id: 'success', label: 'Sucesso', icon: CheckCircleIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { id: 'warning', label: 'Aviso', icon: ExclamationTriangleIcon, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { id: 'error', label: 'Erro', icon: XCircleIcon, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as any)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        type === t.id ? `${t.bg} ${t.border} ring-2 ring-offset-2 ring-offset-slate-800 ring-cyan-500` : 'bg-slate-900 border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <t.icon className={`w-6 h-6 ${t.color}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Novo Tema Disponível!"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mensagem</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva o conteúdo da notificação..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-slate-500 italic">
                  * A notificação será enviada instantaneamente.
                </p>
                <button
                  type="submit"
                  disabled={sending || !title || !message || (targetType === 'specific' && !selectedUserId)}
                  className="bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? 'Enviando...' : (
                    <>
                      <SendIcon className="w-5 h-5" />
                      Enviar Notificação
                    </>
                  )}
                </button>
              </div>
            </form>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <p className="text-sm font-bold">Notificação enviada com sucesso!</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <InfoIcon className="w-5 h-5 text-cyan-400" />
              Dicas de Uso
            </h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                Use o tipo <strong>Informativo</strong> para avisos gerais e novidades.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                Use <strong>Sucesso</strong> para confirmações de pagamento ou pedidos prontos.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                Use <strong>Aviso</strong> para prazos vencendo ou ações pendentes.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                Use <strong>Erro</strong> apenas para problemas críticos ou cancelamentos.
              </li>
            </ul>
          </div>

          <div className="bg-cyan-500/5 rounded-2xl border border-cyan-500/20 p-6">
            <h3 className="text-cyan-400 font-bold mb-2">Impacto</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Notificações em tempo real aumentam o engajamento dos clientes e mantêm todos informados sobre o status de seus serviços.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
