
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/formatters';

// Icon Imports
import DollarSignIcon from '../../components/icons/DollarSignIcon';
import UserIcon from '../../components/icons/UserIcon';
import ShoppingCartIcon from '../../components/icons/ShoppingCartIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon';

interface DashboardStats {
  totalRevenue: number;
  newCustomers: number;
  ordersToday: number;
  expenses: number;
  revenueChange: string;
  customersChange: string;
  ordersChange: string;
  expensesChange: string;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    newCustomers: 0,
    ordersToday: 0,
    expenses: 0,
    revenueChange: '+0%',
    customersChange: '+0%',
    ordersChange: '+0%',
    expensesChange: '+0%'
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // 1. Fetch Revenue (Sales)
        const { data: salesData } = await supabase
          .from('sales')
          .select('total');
        const totalSales = (salesData || []).reduce((acc, curr) => acc + (curr.total || 0), 0);

        // 2. Fetch New Customers (Profiles)
        const { count: customerCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch Orders Today
        const { count: ordersTodayCount } = await supabase
          .from('apostila_orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayISO);

        // 4. Fetch Expenses
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('amount');
        const totalExpenses = (expensesData || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 5. Fetch Recent Orders
        const { data: recentOrdersData } = await supabase
          .from('apostila_orders')
          .select('id, user_name, created_at, total, status')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalRevenue: totalSales,
          newCustomers: customerCount || 0,
          ordersToday: ordersTodayCount || 0,
          expenses: totalExpenses,
          revenueChange: '+0%', // Placeholder for now
          customersChange: '+0%',
          ordersChange: '+0%',
          expensesChange: '+0%'
        });

        setRecentOrders(recentOrdersData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiData = [
    { title: 'Receita Total', value: formatCurrency(stats.totalRevenue), icon: DollarSignIcon, change: stats.revenueChange, changeType: 'positive' },
    { title: 'Total de Clientes', value: stats.newCustomers.toString(), icon: UserIcon, change: stats.customersChange, changeType: 'positive' },
    { title: 'Pedidos Hoje', value: stats.ordersToday.toString(), icon: ShoppingCartIcon, change: stats.ordersChange, changeType: 'positive' },
    { title: 'Despesas Totais', value: formatCurrency(stats.expenses), icon: WalletIcon, change: stats.expensesChange, changeType: 'negative' },
  ];

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'entregue': return 'bg-emerald-500/20 text-emerald-400';
      case 'pago': return 'bg-blue-500/20 text-blue-400';
      case 'enviado': return 'bg-purple-500/20 text-purple-400';
      case 'pending':
      case 'pendente': return 'bg-amber-500/20 text-amber-400';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link
          to="/pdv"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Voltar para o PDV
        </Link>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData.map(item => <KpiCard key={item.title} {...item} />)}
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Últimos Pedidos (Apostilas)</h3>
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
                      <td className="py-4 pr-3 font-medium text-cyan-400">#{order.id.slice(0, 8)}</td>
                      <td className="py-4 px-3 text-slate-300">{order.user_name || 'Cliente'}</td>
                      <td className="py-4 px-3 text-slate-300">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {order.status === 'pending' ? 'Pendente' : order.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right text-white font-medium">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <Link to="/admin/apostilas" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                Ver todos os pedidos &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
