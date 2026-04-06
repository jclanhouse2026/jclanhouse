import React, { useState, useMemo } from 'react';
import { useSales } from '../../../context/SalesContext';
import { formatCurrency } from '../../../lib/formatters';
import HistoryIcon from '../../icons/HistoryIcon';
import SearchIcon from '../../icons/SearchIcon';

const HistoricoModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { sales } = useSales();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const finalizedSales = useMemo(() => {
        return sales.filter(s => s.status === 'finalizado');
    }, [sales]);

    const filteredSales = useMemo(() => {
        return finalizedSales.filter(sale => {
            const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = dateFilter ? sale.dateTime.toISOString().split('T')[0] === dateFilter : true;
            return matchesSearch && matchesDate;
        });
    }, [finalizedSales, searchTerm, dateFilter]);

    const totalPeriodo = useMemo(() => {
        return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    }, [filteredSales]);

    return (
        <div className="bg-[#1e272e] rounded-xl p-6 border border-slate-700 min-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <HistoryIcon className="w-6 h-6 text-cyan-400" />
                    Histórico de Vendas
                </h2>
                <button onClick={onBack} className="text-slate-400 hover:text-white">Voltar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 flex justify-between items-center">
                    <span className="text-slate-400">Total do Período:</span>
                    <span className="text-cyan-400 font-bold text-lg">{formatCurrency(totalPeriodo)}</span>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto">
                <div className="space-y-4">
                    {filteredSales.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            Nenhuma venda finalizada encontrada para este filtro.
                        </div>
                    ) : (
                        filteredSales.map(sale => (
                            <div key={sale.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{sale.customerName}</h3>
                                    <p className="text-sm text-slate-400 mb-2">
                                        {sale.dateTime.toLocaleDateString('pt-BR')} às {sale.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="text-sm text-slate-300">
                                        {sale.items.map((item, idx) => (
                                            <div key={idx}>• {item.quantity}x {item.productName}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between items-end">
                                    <div className="text-xl font-bold text-cyan-400 mb-2">
                                        {formatCurrency(sale.total)}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        Pagamento: <span className="text-white capitalize">{sale.paymentMethod || 'N/A'}</span>
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

export default HistoricoModule;
