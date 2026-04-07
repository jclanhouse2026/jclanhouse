import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from './icons/HomeIcon';
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from './icons/LogoutIcon';
import UserIcon from './icons/UserIcon';
import DashboardIcon from './icons/DashboardIcon';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const closeMenu = () => setIsOpen(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 shadow-cyan-500/10 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-white font-bold text-xl flex items-center gap-2">
              <HomeIcon className="w-6 h-6 text-cyan-400" />
              <span>JC LAN HOUSE</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link to="/servicos" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Serviços</Link>
              <Link to="/portfolio" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Produtos</Link>
              <Link to="/temas-canecas" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Temas de Caneca</Link>
              <Link to="/curriculo" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Currículo</Link>
              
              {user ? (
                <>
                  {/* FIX: Changed condition to only show "Meu Painel" for the 'client' role. The 'pdv_user' role does not exist and moderators have a different panel. */}
                  {user.role === 'client' && <Link to="/cliente" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Meu Painel</Link>}
                  
                  {/* FIX: Replaced non-existent 'pdv_user' role with 'moderator' to correctly link to the PDV dashboard. */}
                  {user.role === 'moderator' && <Link to="/pdv" className="bg-cyan-500 text-white px-3 py-2 rounded-md text-sm font-bold hover:bg-cyan-600 transition-colors">Voltar ao PDV</Link>}

                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Painel Admin</Link>
                      <Link to="/pdv" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Acessar PDV</Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="text-red-400 hover:bg-red-500/20 hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                    <LogoutIcon className="w-4 h-4" /> Sair
                  </button>
                </>
              ) : (
                 <>
                    <Link to="/admin" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Acesso Admin</Link>
                    <Link to="/pdv" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Acessar PDV</Link>
                    <Link to="/login" className="bg-slate-700 text-white hover:bg-slate-600 px-4 py-2 rounded-md text-sm font-bold transition-colors">Login Cliente</Link>
                 </>
              )}

              <Link to="/carrinho" className="relative text-gray-300 hover:text-white p-2 rounded-full hover:bg-slate-700">
                <ShoppingCartIcon className="w-6 h-6" />
                {totalItems > 0 && (
                   <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                     {totalItems}
                   </span>
                )}
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Link to="/carrinho" className="relative text-gray-300 hover:text-white p-2 rounded-full hover:bg-slate-700 mr-2">
                <ShoppingCartIcon className="w-6 h-6" />
                {totalItems > 0 && (
                   <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                     {totalItems}
                   </span>
                )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} type="button" className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link to="/servicos" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Serviços</Link>
            <Link to="/portfolio" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Produtos</Link>
            <Link to="/temas-canecas" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Temas de Caneca</Link>
            <Link to="/curriculo" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Currículo</Link>
            
            {user ? (
               <>
                  {/* FIX: Changed condition to only show "Meu Painel" for the 'client' role for mobile view. */}
                  {user.role === 'client' && <Link to="/cliente" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"><UserIcon className="w-4 h-4 inline-block mr-2"/>Meu Painel</Link>}
                  
                  {/* FIX: Replaced non-existent 'pdv_user' role with 'moderator' for mobile view. */}
                  {user.role === 'moderator' && <Link to="/pdv" onClick={closeMenu} className="bg-cyan-500 text-white block px-3 py-2 rounded-md text-base font-medium">Voltar ao PDV</Link>}

                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"><DashboardIcon className="w-4 h-4 inline-block mr-2"/>Painel Admin</Link>
                      <Link to="/pdv" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Acessar PDV</Link>
                    </>
                  )}
                  <button onClick={() => { handleLogout(); closeMenu(); }} className="w-full text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 block px-3 py-2 rounded-md text-base font-medium"><LogoutIcon className="w-4 h-4 inline-block mr-2"/>Sair</button>
                </>
            ) : (
                <>
                  <Link to="/admin" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Acesso Admin</Link>
                  <Link to="/pdv" onClick={closeMenu} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Acessar PDV</Link>
                  <Link to="/login" onClick={closeMenu} className="bg-slate-700 text-white hover:bg-slate-600 block px-3 py-3 rounded-md text-base font-bold transition-colors text-center">Login Cliente</Link>
                </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;