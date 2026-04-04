
import React from 'react';
import { Link } from 'react-router-dom';

// Icon Imports
import DollarSignIcon from '../../components/icons/DollarSignIcon';
import UserIcon from '../../components/icons/UserIcon';
import ShoppingCartIcon from '../../components/icons/ShoppingCartIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';

const kpiData = [
  { title: 'Receita Total', value: 'R$ 45.890,50', icon: DollarSignIcon, change: '+12.5%', changeType: 'positive' },
  { title: 'Novos Clientes', value: '128', icon: UserIcon, change: '+5.2%', changeType: 'positive' },
  { title: 'Pedidos Hoje', value: '34', icon: ShoppingCartIcon, change: '-2.1%', changeType: 'negative' },
  { title: 'Despesas', value: 'R$ 3.120,00', icon: WalletIcon, change: '+8.0%', changeType: 'negative' },
];

const recentOrders = [
  { id: '#3025', customer: 'Carlos Pereira', date: '16/07/2024', total: 'R$ 250,00', status: 'Pendente' },
  { id: '#3024', customer: 'Ana Beatriz', date: '16/07/2024', total: 'R$ 75,90', status: 'Pago' },
  { id: '#3023', customer: 'Mariana Costa', date: '15/07/2024', total: 'R$ 450,00', status: 'Enviado' },
  { id: '#3021', customer: 'João da Silva', date: '15/07/2024', total: 'R$ 125,50', status: 'Entregue' },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Entregue': return 'bg-emerald-500/20 text-emerald-400';
    case 'Pago': return 'bg-blue-500/20 text-blue-400';
    case 'Enviado': return 'bg-purple-500/20 text-purple-400';
    case 'Pendente': return 'bg-amber-500/20 text-amber-400';
    default: return 'bg-slate-600 text-slate-300';
  }
};

const KpiCard: React.FC<typeof kpiData[0]> = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-start justify-between">
        <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <p className={`text-sm mt-2 ${changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>{change}</p>
        </div>
        <div className="bg-slate-700 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-cyan-400" />
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map(item => <KpiCard key={item.title} {...item} />)}
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Últimos Pedidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-sm text-slate-400">
                <th className="py-3 pr-3">Pedido</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                  <td className="py-4 pr-3 font-medium text-cyan-400">{order.id}</td>
                  <td className="py-4 px-3 text-slate-300">{order.customer}</td>
                  <td className="py-4 px-3 text-slate-300">{order.date}</td>
                  <td className="py-4 px-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right text-white font-medium">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <div className="mt-6 text-center">
            <Link to="/admin/clientes" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                Ver todos os pedidos &rarr;
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
