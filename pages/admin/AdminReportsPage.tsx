
import React from 'react';
import { Link } from 'react-router-dom';
import ReportIcon from '../../components/icons/ReportIcon';
import BarChartIcon from '../../components/icons/BarChartIcon';
import DollarSignIcon from '../../components/icons/DollarSignIcon';
import BoxIcon from '../../components/icons/BoxIcon';

const reportOptions = [
    { title: 'Relatório de Vendas', description: 'Analise o desempenho de vendas por período.', icon: BarChartIcon, link: '/admin/relatorios-financeiros' },
    { title: 'Relatório de Despesas', description: 'Acompanhe o fluxo de saídas financeiras.', icon: DollarSignIcon, link: '/admin/relatorios-financeiros?view=expenses' },
    { title: 'Relatório de Estoque', description: 'Veja o status atual do seu inventário e produtos.', icon: BoxIcon, link: '/admin/portfolio' },
    { title: 'Relatório de Clientes', description: 'Exporte uma lista de todos os clientes cadastrados.', icon: ReportIcon, link: '/admin/clientes' },
]

const AdminReportsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Relatórios</h1>
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <p className="text-slate-400 mb-6">Selecione um tipo de relatório para gerar ou exportar os dados.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportOptions.map(opt => (
                <Link to={opt.link} key={opt.title} className="bg-slate-700/50 p-5 rounded-lg border border-slate-600 flex items-start gap-4 hover:bg-slate-700 transition-colors">
                    <div className="bg-slate-600 p-3 rounded-lg text-cyan-400">
                        <opt.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{opt.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{opt.description}</p>
                        <div className="mt-4 text-sm text-cyan-400 font-semibold">
                            Acessar Relatório &rarr;
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
