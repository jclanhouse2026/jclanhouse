import React from 'react';
import { useSales, Sale } from '../../../context/SalesContext';
import { formatCurrency } from '../../../lib/formatters';
import DollarSignIcon from '../../icons/DollarSignIcon';
import CheckBadgeIcon from '../../icons/CheckBadgeIcon';
import XCircleIcon from '../../icons/XCircleIcon';
import PencilIcon from '../../icons/PencilIcon';

const EmAbertoModule: React.FC<{ onBack: () => void, onEdit: (sale: Sale) => void }> = ({ onBack, onEdit }) => {
    const { sales, updateSale } = useSales();

    const openSales = sales.filter(s => s.status === 'em_aberto');

    const handleFinalize = async (id: string) => {
        // In a real scenario, this might open a payment modal.
        // For now, we just mark it as finalized.
        await updateSale(id, { status: 'finalizado', paymentMethod: 'dinheiro' });
        alert('Venda finalizada com sucesso!');
    };

    const handleCancel = async (id: string) => {
        await updateSale(id, { status: 'cancelado' });
    };

    return (
        <div className="bg-[#1e272e] rounded-xl p-6 border border-slate-700 min-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <DollarSignIcon className="w-6 h-6 text-cyan-400" />
                    Pedidos em Aberto
                </h2>
                <button onClick={onBack} className="text-slate-400 hover:text-white">Voltar</button>
            </div>

            <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {openSales.length === 0 ? (
                        <div className="col-span-full text-center text-slate-500 py-10">
                            Nenhum pedido em aberto.
                        </div>
                    ) : (
                        openSales.map(sale => (
                            <div key={sale.id} className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{sale.customerName}</h3>
                                        <p className="text-xs text-slate-400">
                                            {sale.dateTime.toLocaleDateString('pt-BR')} {sale.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-xl font-bold text-cyan-400">
                                        {formatCurrency(sale.total)}
                                    </div>
                                </div>
                                
                                <div className="bg-slate-700/30 rounded-md p-3 mb-4 flex-grow">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Itens:</h4>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        {sale.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between">
                                                <span>{item.quantity}x {item.productName}</span>
                                                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <button 
                                        onClick={() => handleCancel(sale.id)}
                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Cancelar"
                                    >
                                        <XCircleIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => onEdit(sale)}
                                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleFinalize(sale.id)}
                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckBadgeIcon className="w-5 h-5" />
                                        Finalizar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmAbertoModule;
