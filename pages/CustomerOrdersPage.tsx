import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useThemes } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle, XCircle, Eye, MapPin, Phone, User, Package, MessageCircle, Image as PhotographIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Order, ThemeOrder } from '../types';

const CustomerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { getUserOrders, loading: ordersLoading } = useOrders();
  const { themeOrders, loading: themesLoading } = useThemes();
  const [selectedOrder, setSelectedOrder] = useState<Order | ThemeOrder | null>(null);

  const orders = user ? getUserOrders(user.id) : [];
  const themeOrdersList = user ? themeOrders.filter(o => o.userId === user.id) : [];

  const allOrders = [...orders, ...themeOrdersList].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const loading = ordersLoading || themesLoading;

  const isThemeOrder = (order: any): order is ThemeOrder => {
    return 'productType' in order;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'processing': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusLabel = (status: string) => {
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
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-cyan-400" />
        Meus Pedidos
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {allOrders.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Você ainda não fez nenhum pedido.</p>
            <button 
              onClick={() => window.location.href = '#/servicos'}
              className="mt-6 bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-cyan-500 transition-all"
            >
              Ver Serviços
            </button>
          </div>
        ) : (
          allOrders.map((order) => {
            const themeOrder = isThemeOrder(order);
            return (
              <motion.div
                layout
                key={order.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(order.status)} border`}>
                      {themeOrder ? <PhotographIcon className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">
                          {themeOrder ? `#${order.orderNumber || order.id.substring(0, 8)}` : `#${order.id.substring(0, 8)}`}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        {themeOrder && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-bold">
                            {order.productType}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end">
                    <span className="text-cyan-400 font-bold text-lg">
                      {themeOrder ? 'Sob Consulta' : (order as Order).totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <p className="text-slate-400 text-xs">
                      {themeOrder ? order.themeName : `${(order as Order).items.length} itens`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2 px-4"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="text-sm font-bold">Detalhes</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
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
                  Pedido {isThemeOrder(selectedOrder) ? `#${selectedOrder.orderNumber || selectedOrder.id.substring(0, 8)}` : `#${selectedOrder.id.substring(0, 8)}`}
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                {/* Status Timeline */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Status do Pedido</h4>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -translate-y-1/2 z-0"></div>
                    
                    {[
                      { s: 'pending', icon: Clock, label: 'Pendente' },
                      { s: 'processing', icon: Package, label: 'Produção' },
                      { s: 'completed', icon: CheckCircle, label: 'Concluído' }
                    ].map((step, idx) => {
                      const isCompleted = selectedOrder.status === 'completed' || 
                                       (selectedOrder.status === 'processing' && step.s !== 'completed') ||
                                       (selectedOrder.status === 'pending' && step.s === 'pending');
                      const isActive = selectedOrder.status === step.s;
                      
                      // Theme orders only have pending and completed
                      if (isThemeOrder(selectedOrder) && step.s === 'processing') return null;

                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'
                          } ${isActive ? 'ring-4 ring-cyan-500/20 scale-110' : ''}`}>
                            <step.icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-tighter ${isCompleted ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items / Theme Details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    {isThemeOrder(selectedOrder) ? 'Detalhes do Tema' : 'Itens do Pedido'}
                  </h4>
                  <div className="space-y-3">
                    {isThemeOrder(selectedOrder) ? (
                      <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 border border-slate-600">
                            <img src={selectedOrder.themeImageUrl} alt={selectedOrder.themeName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-white font-bold text-lg">{selectedOrder.themeName}</p>
                            <p className="text-cyan-400 text-sm font-medium uppercase">{selectedOrder.productType}</p>
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Personalização</p>
                              <p className="text-slate-300 text-sm italic">"{selectedOrder.customizationDetails}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      selectedOrder.items.map((item, idx) => (
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
                      ))
                    )}
                  </div>
                </div>

                {/* Delivery Info / Customer Info */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    {isThemeOrder(selectedOrder) ? <User className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} 
                    {isThemeOrder(selectedOrder) ? 'Informações do Cliente' : 'Endereço de Entrega'}
                  </h4>
                  {isThemeOrder(selectedOrder) ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-cyan-400" />
                        <p className="text-xs text-cyan-300">Este pedido foi enviado diretamente para o WhatsApp da empresa.</p>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{isThemeOrder(selectedOrder) ? 'Valor' : 'Total Pago'}</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {isThemeOrder(selectedOrder) ? 'Sob Consulta' : (selectedOrder as Order).totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="bg-slate-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerOrdersPage;
