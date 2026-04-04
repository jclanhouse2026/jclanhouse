
import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Icon Imports
import HomeIcon from '../icons/HomeIcon';
import HomeModernIcon from '../icons/HomeModernIcon';
import DashboardIcon from '../icons/DashboardIcon';
import UsersIcon from '../icons/UsersIcon';
import ReportIcon from '../icons/ReportIcon';
import CogIcon from '../icons/CogIcon';
import BellIcon from '../icons/BellIcon';
import SearchIcon from '../icons/SearchIcon';
import LogoutIcon from '../icons/LogoutIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import CollectionIcon from '../icons/CollectionIcon';
import InboxInIcon from '../icons/InboxInIcon';
import TagIcon from '../icons/TagIcon';
import PhotographIcon from '../icons/PhotographIcon';
import AdjustmentsVerticalIcon from '../icons/AdjustmentsVerticalIcon';
import MenuIcon from '../icons/MenuIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import PlayCircleIcon from '../icons/PlayCircleIcon';
import KeyIcon from '../icons/KeyIcon';

const SidebarLink: React.FC<{ to: string; icon: React.ElementType; children: React.ReactNode }> = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-cyan-500 text-white shadow-lg'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
  >
    <Icon className="w-5 h-5 mr-3" />
    <span>{children}</span>
  </NavLink>
);

const AdminLayout: React.FC = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-700/50">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <HomeIcon className="w-6 h-6 text-cyan-400" />
          <span>JC LAN HOUSE</span>
        </Link>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <SidebarLink to="/admin/dashboard" icon={DashboardIcon}>Dashboard</SidebarLink>
        <SidebarLink to="/admin/clientes" icon={UsersIcon}>Clientes</SidebarLink>
        <SidebarLink to="/admin/users" icon={UsersIcon}>Usuários</SidebarLink>
        <SidebarLink to="/admin/servicos" icon={BriefcaseIcon}>Preços de Serviços</SidebarLink>
        <SidebarLink to="/admin/portfolio" icon={CollectionIcon}>Produtos</SidebarLink>
        <SidebarLink to="/admin/meus-trabalhos" icon={PlayCircleIcon}>Meus Trabalhos</SidebarLink>
        <SidebarLink to="/admin/categorias" icon={TagIcon}>Categorias</SidebarLink>
        <SidebarLink to="/admin/temas" icon={PhotographIcon}>Temas Caderneta</SidebarLink>
        <SidebarLink to="/admin/temas-escolares" icon={PhotographIcon}>Temas Escolares</SidebarLink>
        <SidebarLink to="/admin/imagens" icon={InboxInIcon}>Imagens Enviadas</SidebarLink>
        <SidebarLink to="/admin/relatorios" icon={ReportIcon}>Relatórios</SidebarLink>
        <SidebarLink to="/admin/curriculos" icon={DocumentTextIcon}>Currículos</SidebarLink>
        <SidebarLink to="/admin/pdv-auth" icon={KeyIcon}>Autorizações PDV</SidebarLink>
        <SidebarLink to="/admin/apostila" icon={DocumentTextIcon}>Config. Apostila</SidebarLink>
        <SidebarLink to="/admin/configuracoes-home" icon={HomeModernIcon}>Config. Home</SidebarLink>
        <SidebarLink to="/admin/configuracoes-servicos" icon={AdjustmentsVerticalIcon}>Config. Serviços</SidebarLink>
        <SidebarLink to="/admin/configuracoes" icon={CogIcon}>Configurações Gerais</SidebarLink>
      </nav>
      <div className="p-4 border-t border-slate-700/50">
           <button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-slate-300 hover:bg-red-500/20 hover:text-red-400">
              <LogoutIcon className="w-5 h-5 mr-3" />
              <span>Sair</span>
          </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-slate-700 border border-slate-600 rounded-full py-2 pl-10 pr-4 text-sm w-48 sm:w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-white">
              <BellIcon className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-800"></span>
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2">
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name.replace(' ', '+')}&background=0891b2&color=fff`}
                  alt="Admin"
                  className="w-9 h-9 rounded-full border-2 border-cyan-400 object-cover"
                />
                <span className="text-sm font-medium hidden md:block">{user?.name || 'Admin'}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-10 border border-slate-600">
                  <Link to="/admin/configuracoes" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">Minha Conta</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600">Sair</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
