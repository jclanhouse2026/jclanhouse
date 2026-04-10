import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import UserIcon from '../components/icons/UserIcon';
import ListIcon from '../components/icons/ListIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import DashboardIcon from '../components/icons/DashboardIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import BellIcon from '../components/icons/BellIcon';

const SidebarLink: React.FC<{ to: string; icon: React.ElementType; children: React.ReactNode }> = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center p-3 text-slate-300 rounded-md hover:bg-slate-700 transition-colors ${
        isActive ? 'bg-slate-700 font-semibold text-white' : ''
      }`
    }
  >
    <Icon className="w-5 h-5 mr-3 text-cyan-400" />
    <span>{children}</span>
  </NavLink>
);

const CustomerPanelPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <h1 className="text-3xl font-bold text-white mb-8">Meu Painel</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 space-y-2 sticky top-24">
                <SidebarLink to="/cliente/dashboard" icon={DashboardIcon}>Dashboard</SidebarLink>
                <SidebarLink to="/cliente/pedidos" icon={ListIcon}>Meus Pedidos</SidebarLink>
                <SidebarLink to="/cliente/curriculos" icon={DocumentTextIcon}>Meus Currículos</SidebarLink>
                <SidebarLink to="/cliente/notificacoes" icon={BellIcon}>Notificações</SidebarLink>
                <SidebarLink to="/cliente/endereco" icon={MapPinIcon}>Endereço</SidebarLink>
                <SidebarLink to="/cliente/perfil" icon={UserIcon}>Meus Dados</SidebarLink>
                <button onClick={handleLogout} className="w-full flex items-center p-3 text-slate-300 rounded-md hover:bg-slate-700 transition-colors">
                    <LogoutIcon className="w-5 h-5 mr-3 text-red-400" /> Sair
                </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
             <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerPanelPage;