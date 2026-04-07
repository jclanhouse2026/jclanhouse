import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { ShoppingBag, CheckCircle, Clock, XCircle, Eye, Trash2, MapPin, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Order } from '../../types';

const AdminOrdersPage: React.FC = () => {
  const { orders, loading, updateOrderStatus, deleteOrder } = useOrders();
  const { addNotification } = useNotifications();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleStatusUpdate = async (orderId: string, userId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      let title = '';
      let message = '';
      
      switch(newStatus) {
        case 'processing':
          title = 'Pedido em Produção';
          message = 'Seu pedido já está sendo produzido pela nossa equipe!';
          break;
        case 'completed':
          title = 'Pedido Concluído';
          message = 'Seu pedido foi finalizado e já está pronto para entrega/retirada!';
          break;
        case 'cancelled':
          title = 'Pedido Cancelado';
          message = 'Seu pedido foi cancelado. Entre em contato para mais informações.';
          break;
      }
      
      if (title) {
        await addNotification(userId, title, message, 'info');
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'processing': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Em Produção';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-cyan-400" />
          Gerenciamento de Pedidos
        </h2>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === s 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s === 'all' ? 'Todos' : getStatusLabel(s as Order['status'])}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              layout
              key={order.id}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(order.status)} border`}>
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">#{order.id.substring(0, 8)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end">
                  <span className="text-cyan-400 font-bold text-lg">
                    {order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <p className="text-slate-400 text-xs">{order.items.length} itens</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <div className="h-8 w-px bg-slate-700 mx-1 hidden md:block"></div>
                  
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, order.userId, 'processing')}
                      className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors"
                      title="Iniciar Produção"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  )}
                  
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, order.userId, 'completed')}
                      className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition-colors"
                      title="Concluir Pedido"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  
                  {order.status !== 'cancelled' && order.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, order.userId, 'cancelled')}
                      className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                      title="Cancelar Pedido"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este pedido permanentemente?')) {
                        deleteOrder(order.id);
                      }
                    }}
                    className="p-2 bg-slate-700 text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Pedido #{selectedOrder.id.substring(0, 8)}
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User className="w-3 h-3" /> Cliente
                    </h4>
                    <p className="text-white font-medium">{selectedOrder.customerName}</p>
                    <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3" /> {selectedOrder.customerPhone}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Endereço
                    </h4>
                    <p className="text-white text-sm">
                      {selectedOrder.address.street}, {selectedOrder.address.number}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {selectedOrder.address.neighborhood}, {selectedOrder.address.city} - {selectedOrder.address.state}
                    </p>
                    {selectedOrder.address.referencePoint && (
                      <p className="text-cyan-400/80 text-xs mt-2 italic">
                        Ref: {selectedOrder.address.referencePoint}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Itens do Pedido</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="w-12 h-12 bg-slate-700 rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="text-white font-medium text-sm">{item.name}</p>
                          <p className="text-slate-400 text-xs">Qtd: {item.quantity} x {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total do Pedido</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {selectedOrder.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="flex gap-3">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedOrder.id, selectedOrder.userId, 'processing');
                        setSelectedOrder(null);
                      }}
                      className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-cyan-500 transition-all"
                    >
                      Iniciar Produção
                    </button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedOrder.id, selectedOrder.userId, 'completed');
                        setSelectedOrder(null);
                      }}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-500 transition-all"
                    >
                      Concluir Pedido
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;
