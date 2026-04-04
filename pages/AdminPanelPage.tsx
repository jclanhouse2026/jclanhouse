
import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '../components/icons/HomeIcon';

const AdminPanelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-white mb-4">Painel do Administrador</h1>
      <p className="text-xl text-slate-300 mb-8">
        Esta área é para a gestão completa do site.
      </p>
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700">
        <p className="text-slate-400">O painel de administrador completo com todas as configurações do site, gerenciamento de produtos, usuários e relatórios estaria localizado aqui.</p>
      </div>
      <Link to="/pdv" className="mt-8 inline-flex items-center gap-2 bg-cyan-500 text-white font-bold py-3 px-6 rounded-full hover:bg-cyan-600 transition-colors shadow-lg">
        <HomeIcon className="w-5 h-5" />
        <span>Voltar para o Dashboard</span>
      </Link>
    </div>
  );
};

export default AdminPanelPage;
