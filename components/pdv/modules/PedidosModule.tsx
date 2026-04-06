import React, { useState } from 'react';
import { useSales, Sale, SaleStatus } from '../../../context/SalesContext';
import { formatCurrency } from '../../../lib/formatters';
import ListIcon from '../../icons/ListIcon';
import CheckBadgeIcon from '../../icons/CheckBadgeIcon';
import XCircleIcon from '../../icons/XCircleIcon';
import PencilIcon from '../../icons/PencilIcon';

const PedidosModule: React.FC<{ onBack: () => void, onEdit: (sale: Sale) => void }> = ({ onBack, onEdit }) => {
    const { sales, updateSale } = useSales();
    const [filter, setFilter] = useState<SaleStatus | 'todos'>('todos');

    const filteredSales = sales.filter(sale => {
        // Exclude orcamentos from Pedidos view unless specified, but let's include em_aberto, finalizado, cancelado
        if (sale.status === 'orcamento') return false;
        if (filter === 'todos') return true;
        return sale.status === filter;
    });

    const handleStatusChange = async (id: string, newStatus: SaleStatus) => {
        await updateSale(id, { status: newStatus });
    };

    const getStatusBadge = (status: SaleStatus) => {
        switch (status) {
            case 'em_aberto': return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs font-bold">Em Andamento</span>;
            case 'finalizado': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-bold">Finalizado</span>;
            case 'cancelado': return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-bold">Cancelado</span>;
            default: return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-md text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="bg-[#1e272e] rounded-xl p-6 border border-slate-700 min-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ListIcon className="w-6 h-6 text-cyan-400" />
                    Pedidos
                </h2>
                <button onClick={onBack} className="text-slate-400 hover:text-white">Voltar</button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['todos', 'em_aberto', 'finalizado', 'cancelado'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            filter === f ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        {f === 'todos' ? 'Todos' : f === 'em_aberto' ? 'Em Andamento' : f === 'finalizado' ? 'Finalizados' : 'Cancelados'}
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto">
                <div className="space-y-4">
                    {filteredSales.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            Nenhum pedido encontrado.
                        </div>
                    ) : (
                        filteredSales.map(sale => (
                            <div key={sale.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">{sale.customerName}</h3>
                                        {getStatusBadge(sale.status)}
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">
                                        {sale.dateTime.toLocaleDateString('pt-BR')} às {sale.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="text-sm text-slate-300">
                                        {sale.items.map((item, idx) => (
                                            <div key={idx}>• {item.quantity}x {item.productName}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between items-end min-w-[150px]">
                                    <div className="text-xl font-bold text-cyan-400 mb-4">
                                        {formatCurrency(sale.total)}
                                    </div>
                                    <div className="flex gap-2">
                                        {sale.status === 'em_aberto' && (
                                            <>
                                                <button 
                                                    onClick={() => onEdit(sale)}
                                                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                                                    title="Editar Pedido"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(sale.id, 'cancelado')}
                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                                                    title="Cancelar Pedido"
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(sale.id, 'finalizado')}
                                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold transition-colors flex items-center gap-2"
                                                >
                                                    <CheckBadgeIcon className="w-5 h-5" />
                                                    Concluir
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PedidosModule;
