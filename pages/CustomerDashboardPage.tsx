
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import { useSales } from '../context/SalesContext';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import { formatCurrency } from '../lib/formatters';

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Entregue': return 'bg-emerald-500/20 text-emerald-400';
    case 'Em Processamento': return 'bg-amber-500/20 text-amber-400';
    case 'Cancelado': return 'bg-red-500/20 text-red-400';
    case 'Pendente': return 'bg-amber-500/20 text-amber-400';
    case 'Pago': return 'bg-blue-500/20 text-blue-400';
    default: return 'bg-slate-600 text-slate-300';
  }
};

const CustomerDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { customers } = useCustomers();
    const { sales } = useSales();

    const currentUser = customers.find(c => c.userId === user?.id);
    const recentOrders = sales.filter(s => s.customerName === currentUser?.fullName).slice(0, 5);

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo(a), {currentUser?.fullName?.split(' ')[0] || 'Cliente'}!</h2>
            <p className="text-slate-400 mb-6">Aqui está um resumo rápido da sua atividade recente.</p>
            
            <h3 className="text-lg font-semibold text-white mb-4">Pedidos Recentes</h3>
            {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700 text-sm text-slate-400">
                                <th className="py-3 pr-3">Pedido</th>
                                <th className="py-3 px-3">Data</th>
                                <th className="py-3 px-3">Status</th>
                                <th className="py-3 px-3 text-right">Total</th>
                                <th className="py-3 pl-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                                    <td className="py-4 pr-3 font-medium text-cyan-400">#{String(order.id).slice(-6)}</td>
                                    <td className="py-4 px-3 text-slate-300">{order.dateTime.toLocaleDateString('pt-BR')}</td>
                                    <td className="py-4 px-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.amountPaid && order.amountPaid >= (order.total || 0) ? 'Pago' : 'Pendente')}`}>
                                            {order.amountPaid && order.amountPaid >= (order.total || 0) ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-3 text-right text-white font-medium">{formatCurrency(order.total)}</td>
                                    <td className="py-4 pl-3 text-right">
                                        <Link to="/cliente/pedidos" className="text-cyan-400 hover:text-cyan-300">
                                        <ChevronRightIcon className="w-5 h-5"/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-slate-400">Você ainda não tem pedidos.</p>
            )}

            <div className="mt-6 text-center">
                <Link to="/cliente/pedidos" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                    Ver todos os pedidos &rarr;
                </Link>
            </div>
        </div>
    );
};

export default CustomerDashboardPage;
