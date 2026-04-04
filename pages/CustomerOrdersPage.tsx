
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import { useSales } from '../context/SalesContext';
import ListIcon from '../components/icons/ListIcon';
import { formatCurrency } from '../lib/formatters';

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Pago': return 'bg-emerald-500/20 text-emerald-400';
    case 'Pendente': return 'bg-amber-500/20 text-amber-400';
    default: return 'bg-slate-600 text-slate-300';
  }
};

const CustomerOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { customers } = useCustomers();
    const { sales } = useSales();

    const currentUser = customers.find(c => c.userId === user?.id);
    const userOrders = sales.filter(s => s.customerName === currentUser?.fullName).sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ListIcon className="w-6 h-6" />
                Meus Pedidos
            </h2>

            <div className="space-y-4">
                {userOrders.length > 0 ? userOrders.map(order => (
                    <div key={order.id} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-400">Pedido #{String(order.id).slice(-6)}</p>
                                <p className="font-bold text-white text-lg">{formatCurrency(order.total)}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.amountPaid && order.amountPaid >= (order.total || 0) ? 'Pago' : 'Pendente')}`}>
                                    {order.amountPaid && order.amountPaid >= (order.total || 0) ? 'Pago' : 'Pendente'}
                                </span>
                                <p className="text-sm text-slate-400 mt-1">{order.dateTime.toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-600">
                             <h4 className="text-sm font-semibold text-slate-300 mb-2">Itens:</h4>
                             <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                                {order.items.map((item, index) => (
                                    <li key={index}>
                                        {item.quantity}x {item.productName}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-400 text-center py-8">Nenhum pedido encontrado.</p>
                )}
            </div>
        </div>
    );
};

export default CustomerOrdersPage;
