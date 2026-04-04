
import React, { useState } from 'react';
import DocumentTextIcon from '../../components/icons/DocumentTextIcon';
import CogIcon from '../../components/icons/CogIcon';
import CheckBadgeIcon from '../../components/icons/CheckBadgeIcon';
import ResumeSettings from '../../components/admin/curriculo/ResumeSettings';
import ResumeRequestsList from '../../components/admin/curriculo/ResumeRequestsList';

type Tab = 'feitos' | 'configuracao' | 'autorizados';

const AdminCurriculumsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('autorizados');

    const TabButton: React.FC<{ tabId: Tab; children: React.ReactNode; icon: React.ElementType }> = ({ tabId, children, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabId ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
        >
            <Icon className="w-5 h-5" />
            {children}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'feitos':
                return (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Currículos Criados Recentemente</h3>
                        <div className="bg-slate-700/50 p-8 rounded-lg text-center text-slate-400">
                            <p>Esta área listará todos os currículos salvos pelos usuários.</p>
                            <p className="text-sm mt-1">Você poderá visualizar, editar ou excluir os currículos.</p>
                        </div>
                    </div>
                );
            case 'configuracao':
                return <ResumeSettings />;
            case 'autorizados':
                return <ResumeRequestsList />;
            default:
                return null;
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <DocumentTextIcon className="w-6 h-6" />
                    Gerenciamento de Currículos
                </h1>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <div className="flex space-x-2">
                        <TabButton tabId="feitos" icon={DocumentTextIcon}>Currículos Feitos</TabButton>
                        <TabButton tabId="autorizados" icon={CheckBadgeIcon}>Solicitações</TabButton>
                        <TabButton tabId="configuracao" icon={CogIcon}>Configuração</TabButton>
                    </div>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminCurriculumsPage;
