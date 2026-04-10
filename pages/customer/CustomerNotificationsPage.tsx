import React from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import BellIcon from '../../components/icons/BellIcon';
import CheckIcon from '../../components/icons/CheckIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import InfoIcon from '../../components/icons/InfoIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import ExclamationTriangleIcon from '../../components/icons/ExclamationTriangleIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';

const CustomerNotificationsPage: React.FC = () => {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-6 h-6 text-emerald-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" />;
      case 'error': return <XCircleIcon className="w-6 h-6 text-red-400" />;
      default: return <InfoIcon className="w-6 h-6 text-cyan-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <BellIcon className="w-8 h-8 text-cyan-400" />
          Minhas Notificações
        </h2>
        {notifications.some(n => !n.read) && (
          <button
            onClick={() => markAllAsRead()}
            className="text-sm text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellIcon className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="text-slate-400 text-lg">Você não tem notificações no momento.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 transition-all hover:bg-slate-700/50 relative group ${!notification.read ? 'bg-cyan-500/5' : ''}`}
              >
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-lg font-bold ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="Marcar como lida"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-400 mt-3 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CustomerNotificationsPage;
