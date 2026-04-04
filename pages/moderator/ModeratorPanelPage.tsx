
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ModeratorPanelPage: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header/>
            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 text-white">
                <h1 className="text-4xl font-bold">Painel do Moderador</h1>
                <p className="text-lg text-slate-300 mt-2">Bem-vindo, {user?.name || 'Moderador'}.</p>
                <div className="mt-8 flex gap-4">
                    <Link to="/pdv" className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600">
                        Acessar Ponto de Venda (PDV)
                    </Link>
                    <Link to="/" className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600">
                        Ir para Home
                    </Link>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default ModeratorPanelPage;
