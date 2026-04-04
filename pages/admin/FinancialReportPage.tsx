
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSales, Sale } from '../../context/SalesContext';
import { useExpenses, Expense } from '../../context/ExpensesContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency, safeToFixed } from '../../lib/formatters';

import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon';
import WalletIcon from '../../components/icons/WalletIcon';
import UsersIcon from '../../components/icons/UsersIcon';
import BarChartIcon from '../../components/icons/BarChartIcon';
import ExclamationTriangleIcon from '../../components/icons/ExclamationTriangleIcon';
import HomeIcon from '../../components/icons/HomeIcon';
import PrinterIcon from '../../components/icons/PrinterIcon';
import DocumentArrowDownIcon from '../../components/icons/DocumentArrowDownIcon';

type View = 'sales' | 'expenses' | 'debts' | 'employees';
type FilterPeriod = 'today' | 'week' | 'month' | 'year';

const FinancialReportPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const reportRef = useRef<HTMLDivElement>(null);
    
    const query = new URLSearchParams(location.search);
    const initialView = (query.get('view') as View) || 'sales';
    
    const [activeView, setActiveView] = useState<View>(initialView);
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week');
    const [searchTerm, setSearchTerm] = useState('');

    const { sales } = useSales();
    const { expenses } = useExpenses();

    const { kpis, weeklyChartData, filteredData } = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // --- KPI Calculations ---
        const salesToday = sales.filter(s => s.dateTime >= today);
        const salesMonth = sales.filter(s => s.dateTime >= startOfMonth);
        const expensesToday = expenses.filter(e => e.dateTime >= today);
        const expensesMonth = expenses.filter(e => e.dateTime >= startOfMonth);

        const totalSalesToday = salesToday.reduce((sum, s) => sum + (s.total || 0), 0);
        const totalSalesMonth = salesMonth.reduce((sum, s) => sum + (s.total || 0), 0);
        const totalExpensesToday = expensesToday.reduce((sum, e) => sum + (e.total || 0), 0);
        const totalExpensesMonth = expensesMonth.reduce((sum, e) => sum + (e.total || 0), 0);

        const openAmount = sales.reduce((sum, s) => {
            const paid = s.amountPaid || 0;
            const debt = (s.total || 0) - paid;
            return debt > 0 ? sum + debt : sum;
        }, 0);

        const kpis = {
            salesToday: totalSalesToday,
            salesMonth: totalSalesMonth,
            profitToday: totalSalesToday - totalExpensesToday,
            profitMonth: totalSalesMonth - totalExpensesMonth,
            open: openAmount,
        };
        
        // --- Weekly Chart Data ---
        const weeklyChartData = Array.from({ length: 7 }).map((_, i) => {
            const day = new Date(today);
            day.setDate(today.getDate() - (6 - i));
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);

            const total = sales
                .filter(s => s.dateTime >= dayStart && s.dateTime < dayEnd)
                .reduce((sum, s) => sum + (s.total || 0), 0);
            
            return { day: day.getDate(), total: total };
        });

        // --- Filtered Data for Table ---
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        let data: any[] = [];
        if (activeView === 'sales' || activeView === 'debts') {
             let flattenedSales = sales.flatMap(sale => 
                sale.items.map(item => ({
                    saleId: sale.id,
                    customerName: sale.customerName,
                    dateTime: sale.dateTime,
                    productName: item.productName,
                    itemTotal: (item.unitPrice || 0) * (item.quantity || 0),
                    saleTotal: sale.total || 0,
                    amountPaid: sale.amountPaid ?? 0
                }))
            );
            
            if (activeView === 'debts') {
                const saleDebts: Record<number, boolean> = {};
                sales.forEach(s => {
                    if ((s.amountPaid ?? 0) < (s.total || 0)) {
                        saleDebts[s.id] = true;
                    }
                });
                flattenedSales = flattenedSales.filter(item => saleDebts[item.saleId]);
            }
            data = flattenedSales;
        } else if (activeView === 'expenses') {
            data = expenses;
        }

        let filteredData = data.filter(item => {
            if (filterPeriod === 'today') return item.dateTime >= today;
            if (filterPeriod === 'week') return item.dateTime >= startOfWeek;
            if (filterPeriod === 'month') return item.dateTime >= startOfMonth;
            if (filterPeriod === 'year') return item.dateTime >= startOfYear;
            return true;
        }).filter(item => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            if ('productName' in item) { // It's a flattened Sale Item
                return item.customerName.toLowerCase().includes(term) || item.productName.toLowerCase().includes(term);
            } else { // It's an Expense
                return item.description.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
            }
        });
        
        return { kpis, weeklyChartData, filteredData };
    }, [sales, expenses, activeView, filterPeriod, searchTerm]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        const content = reportRef.current;
        if (!content) return;
        
        try {
            const canvas = await html2canvas(content, { 
                scale: 2, 
                backgroundColor: '#111827', // dark bg for light text
                onclone: (document) => { // Temporarily change text color for capture
                     document.querySelectorAll('.printable-area, .printable-area *').forEach(el => {
                        (el as HTMLElement).style.color = '#e5e7eb';
                    });
                     document.querySelectorAll('.printable-area .text-slate-400').forEach(el => {
                        (el as HTMLElement).style.color = '#9ca3af';
                    });
                }
             });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'pt', 'a4'); // landscape
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`relatorio-${activeView}-${new Date().toISOString().slice(0,10)}.pdf`);
        } catch(e) {
            console.error(e);
            alert("Ocorreu um erro ao gerar o PDF.");
        }
    };


    const KpiCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
        <div className="flex flex-col items-center">
            <p className="text-sm text-slate-400">{label}</p>
            <div className={`mt-1 text-lg font-bold py-1 px-4 rounded-lg border-2 ${color}`}>
                {formatCurrency(value)}
            </div>
        </div>
    );
    
    const BarChart: React.FC<{ data: { day: number, total: number }[] }> = ({ data }) => {
        const maxValue = Math.max(...data.map(d => d.total), 1);
        return (
            <div className="w-full h-64 bg-slate-800/50 p-4 rounded-lg flex items-end gap-2 border border-slate-700/50 no-print">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end group">
                <div 
                    className="w-full bg-blue-500 group-hover:bg-blue-400 rounded-t-md transition-colors"
                    style={{ height: `${(item.total / maxValue) * 100}%` }}
                >
                    <div className="opacity-0 group-hover:opacity-100 text-center text-xs text-white bg-slate-900/50 p-1 rounded-md -mt-8">
                       {formatCurrency(item.total)}
                    </div>
                </div>
                <div className="text-xs text-slate-400 mt-1">{item.day}</div>
                </div>
            ))}
            </div>
        );
    };

    return (
        <div className="bg-slate-900 min-h-full flex flex-col text-white font-sans p-4">
            {/* Header */}
            <header className="flex items-center justify-between mb-4 flex-shrink-0 no-print">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/admin/relatorios')} className="p-2 hover:bg-slate-700 rounded-full">
                        <ChevronLeftIcon className="w-6 h-6"/>
                    </button>
                    <button onClick={() => navigate('/pdv')} className="p-2 hover:bg-slate-700 rounded-full">
                        <HomeIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="flex-1 ml-4 lg:hidden">
                    <select value={activeView} onChange={e => setActiveView(e.target.value as View)} className="bg-slate-800 border border-slate-600 rounded-md p-2 font-bold">
                        <option value="sales">VENDAS</option>
                        <option value="expenses">DESPESAS</option>
                        <option value="debts">DÉBITOS</option>
                    </select>
                </div>
                <div className="hidden lg:flex items-center gap-4 text-sm flex-wrap justify-end">
                    <KpiCard label="Vendas Hoje" value={kpis.salesToday} color="border-emerald-500 text-emerald-400" />
                    <KpiCard label="Vendas Mês" value={kpis.salesMonth} color="border-emerald-500 text-emerald-400" />
                    <KpiCard label="Lucro Hoje" value={kpis.profitToday} color="border-yellow-500 text-yellow-400" />
                    <KpiCard label="Lucro Mês" value={kpis.profitMonth} color="border-yellow-500 text-yellow-400" />
                    <KpiCard label="Em Aberto" value={kpis.open} color="border-red-500 text-red-400" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Left Sidebar */}
                <nav className="w-full lg:w-60 flex-shrink-0 no-print">
                    <div className="flex flex-row lg:flex-col gap-2 lg:space-y-3 overflow-x-auto lg:overflow-x-visible">
                        <button onClick={() => setActiveView('sales')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors flex-shrink-0 ${activeView === 'sales' ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                            <BarChartIcon className="w-5 h-5 text-emerald-400"/> Relatório Vendas
                        </button>
                        <button onClick={() => setActiveView('expenses')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors flex-shrink-0 ${activeView === 'expenses' ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                            <WalletIcon className="w-5 h-5 text-red-400"/> Relatório Despesas
                        </button>
                        <button onClick={() => setActiveView('debts')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors flex-shrink-0 ${activeView === 'debts' ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-400"/> Relatório Débitos
                        </button>
                        <button onClick={() => setActiveView('employees')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors text-slate-500 cursor-not-allowed flex-shrink-0`}>
                            <UsersIcon className="w-5 h-5"/> Funcionários
                        </button>
                    </div>
                </nav>

                {/* Right Content Area */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <h2 className="text-xl font-bold no-print">Gráfico Semanal</h2>
                    <BarChart data={weeklyChartData} />
                    
                    <div ref={reportRef} className="flex-1 flex flex-col bg-slate-800 rounded-xl p-4 border border-slate-700 overflow-hidden printable-area">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 no-print gap-2">
                             <div className="flex items-center gap-2">
                                <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-1 px-3 rounded-md"><PrinterIcon className="w-4 h-4" /> Imprimir</button>
                                <button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-1 px-3 rounded-md"><DocumentArrowDownIcon className="w-4 h-4" /> Baixar PDF</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setFilterPeriod('today')} className={`px-3 py-1 text-xs rounded-md ${filterPeriod==='today' ? 'bg-slate-600' : 'bg-slate-700'}`}>Hoje</button>
                                <button onClick={() => setFilterPeriod('week')} className={`px-3 py-1 text-xs rounded-md ${filterPeriod==='week' ? 'bg-slate-600' : 'bg-slate-700'}`}>Semana</button>
                                <button onClick={() => setFilterPeriod('month')} className={`px-3 py-1 text-xs rounded-md ${filterPeriod==='month' ? 'bg-slate-600' : 'bg-slate-700'}`}>Mês</button>
                                <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-700 px-3 py-1 rounded-md text-xs w-32 sm:w-48"/>
                            </div>
                        </div>
                        <h3 className="font-bold mb-4 text-lg">
                            {activeView === 'sales' && 'Histórico Detalhado de Vendas'}
                            {activeView === 'expenses' && 'Histórico de Despesas'}
                            {activeView === 'debts' && 'Relatório de Débitos (Contas a Receber)'}
                        </h3>
                        <div className="flex-1 overflow-auto">
                           {(activeView === 'sales' || activeView === 'debts') ? (
                               <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-slate-800">
                                    <tr className="border-b border-slate-700 text-slate-400">
                                        <th className="py-2 px-2">Produto</th>
                                        <th className="py-2 px-2 hidden sm:table-cell">Cliente</th>
                                        <th className="py-2 px-2 hidden md:table-cell">Data</th>
                                        <th className="py-2 px-2 text-right">Valor Item</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={`${item.saleId}-${index}`} className="border-b border-slate-700/50">
                                            <td className="py-2 px-2 font-medium">{item.productName}</td>
                                            <td className="py-2 px-2 text-slate-400 hidden sm:table-cell">{item.customerName}</td>
                                            <td className="py-2 px-2 text-slate-400 hidden md:table-cell">{item.dateTime.toLocaleString('pt-BR')}</td>
                                            <td className="py-2 px-2 text-right font-bold">{formatCurrency(item.itemTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                               </table>
                           ) : (
                                <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-slate-800">
                                    <tr className="border-b border-slate-700 text-slate-400">
                                        <th className="py-2 px-2">Descrição</th>
                                        <th className="py-2 px-2 hidden sm:table-cell">Data</th>
                                        <th className="py-2 px-2 text-right">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(item => (
                                        <tr key={item.id} className="border-b border-slate-700/50">
                                            <td className="py-2 px-2 font-medium">{item.description}</td>
                                            <td className="py-2 px-2 text-slate-400 hidden sm:table-cell">{item.dateTime.toLocaleString('pt-BR')}</td>
                                            <td className="py-2 px-2 text-right font-bold">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                               </table>
                           )}
                           {filteredData.length === 0 && <p className="text-center text-slate-500 py-8">Nenhum registro encontrado.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FinancialReportPage;
