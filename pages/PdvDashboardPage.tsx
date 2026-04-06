import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { DashboardItem } from '../types';
import DashboardCard from '../components/DashboardCard';
import { useCompany } from '../context/CompanyContext';
import { useCustomers } from '../context/CustomerContext';
import type { Sale } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';

// Modal and Component imports
import ExpenseModal from '../components/pdv/ExpenseModal';
import SaleModal from '../components/pdv/SaleModal';
import OrcamentosModule from '../components/pdv/modules/OrcamentosModule';
import PedidosModule from '../components/pdv/modules/PedidosModule';
import HistoricoModule from '../components/pdv/modules/HistoricoModule';
import RecibosModule from '../components/pdv/modules/RecibosModule';
import EmAbertoModule from '../components/pdv/modules/EmAbertoModule';

// Icon imports
import HomeIcon from '../components/icons/HomeIcon';
import CogIcon from '../components/icons/CogIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import WalletIcon from '../components/icons/WalletIcon';
import CalculatorIcon from '../components/icons/CalculatorIcon';
import ListIcon from '../components/icons/ListIcon';
import HistoryIcon from '../components/icons/HistoryIcon';
import BoxIcon from '../components/icons/BoxIcon';
import ReceiptIcon from '../components/icons/ReceiptIcon';
import DollarSignIcon from '../components/icons/DollarSignIcon';
import XCircleIcon from '../components/icons/XCircleIcon';

const dashboardItems: DashboardItem[] = [
  { icon: ShoppingCartIcon, title: 'Nova Venda', subtitle: 'PDV Completo', action: 'nova_venda', hasMore: true, isSpecial: true },
  { icon: WalletIcon, title: 'Despesas', subtitle: 'Controle de saídas', action: 'despesas', hasMore: true, isSpecial: true },
  { icon: CalculatorIcon, title: 'Orçamentos', action: 'orcamentos', hasMore: true },
  { icon: ListIcon, title: 'Pedidos', action: 'pedidos', hasMore: true },
  { icon: HistoryIcon, title: 'Histórico', action: 'historico' },
  { icon: BoxIcon, title: 'Estoque', action: 'link', to: '/admin/portfolio' },
  { icon: ReceiptIcon, title: 'Recibos', subtitle: 'Histórico de vendas', action: 'recibos' },
  { icon: DollarSignIcon, title: 'Em Aberto', action: 'em_aberto' },
];

const PdvDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { companyInfo } = useCompany();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const { customers, addCustomer } = useCustomers();
    const [latestSale, setLatestSale] = useState<Sale | null>(null);

    const handleCardClick = (action?: string, to?: string) => {
        if (action === 'link' && to) {
            navigate(to);
        } else if (action === 'nova_venda' || action === 'despesas') {
            setActiveModal(action);
        } else if (action) {
            setActiveModule(action);
        } else {
            alert('Ação não implementada.');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    const handleSaleComplete = (sale: Sale) => {
        setLatestSale(sale);
        // The SaleModal will show the receipt step.
    };

    const renderActiveModule = () => {
        switch (activeModule) {
            case 'orcamentos': return <OrcamentosModule onBack={() => setActiveModule(null)} />;
            case 'pedidos': return <PedidosModule onBack={() => setActiveModule(null)} onEdit={(sale) => {
                setLatestSale(sale);
                setActiveModal('editar_venda');
            }} />;
            case 'historico': return <HistoricoModule onBack={() => setActiveModule(null)} />;
            case 'recibos': return <RecibosModule onBack={() => setActiveModule(null)} />;
            case 'em_aberto': return <EmAbertoModule onBack={() => setActiveModule(null)} onEdit={(sale) => {
                setLatestSale(sale);
                setActiveModal('editar_venda');
            }} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#13171a] text-slate-300 font-sans">
            {/* Header */}
            <header className="bg-[#1e272e]/80 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-700/50 print:hidden">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-white font-bold text-lg flex items-center gap-2">
                           <HomeIcon className="w-6 h-6 text-cyan-400" />
                           <span>{companyInfo.name}</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-sm text-white">{user?.name}</p>
                            <p className="text-xs text-slate-400">{user?.role === 'admin' ? 'Administrador' : 'Moderador'}</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                            <LogoutIcon className="w-6 h-6 text-red-400"/>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                {activeModule ? (
                    renderActiveModule()
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {dashboardItems.map((item) => (
                            <div key={item.title} onClick={() => handleCardClick(item.action, item.to)}>
                               <DashboardCard {...item} />
                            </div>
                        ))}
                        {user?.role === 'admin' && (
                            <Link to="/admin">
                                 <DashboardCard icon={CogIcon} title="Painel Admin" subtitle="Configurações" />
                            </Link>
                        )}
                    </div>
                )}
            </main>

            {/* Modals */}
            {(activeModal === 'nova_venda' || activeModal === 'editar_venda') && (
                <SaleModal 
                    onClose={() => setActiveModal(null)} 
                    onSaleComplete={handleSaleComplete}
                    customers={customers}
                    addCustomer={addCustomer}
                    initialSale={activeModal === 'editar_venda' && latestSale ? latestSale : undefined}
                />
            )}
            {activeModal === 'despesas' && (
                <ExpenseModal onClose={() => setActiveModal(null)} />
            )}
        </div>
    );
};

export default PdvDashboardPage;