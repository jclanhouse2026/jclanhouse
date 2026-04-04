import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../context/ExpensesContext';
import { formatCurrency } from '../../lib/formatters';

// Icon imports
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import RefreshIcon from '../icons/RefreshIcon';

const ExpenseModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addExpense } = useExpenses();
    const [date, setDate] = useState(new Date());
    const [expenseType, setExpenseType] = useState('Padrão');
    const [description, setDescription] = useState('');
    const [observation, setObservation] = useState('');
    const [supplier, setSupplier] = useState('');
    const [category, setCategory] = useState('');
    const [unitValue, setUnitValue] = useState(0);
    const [quantity, setQuantity] = useState(1.00);
    const [amountPaid, setAmountPaid] = useState(0.00);
    const [paymentMethod, setPaymentMethod] = useState('Dinheiro');

    const total = useMemo(() => unitValue * quantity, [unitValue, quantity]);
    
    // Mock data for dropdowns
    const mockSuppliers = ['Fornecedor teste', 'Material de Limpeza ABC', 'Papelaria Central'];
    const mockCategories = ['Geral', 'Material de Escritório', 'Limpeza', 'Manutenção'];
    const mockExpenseTypes = ['Padrão', 'Recorrente', 'Extraordinária'];
    const mockPaymentMethods = ['Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'PIX', 'Boleto'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || total <= 0) {
            alert("Por favor, preencha a descrição e verifique os valores.");
            return;
        }
        addExpense({
            expenseType, description, observation, supplier, category, total, paymentMethod
        });
        alert(`Despesa de ${formatCurrency(total)} registrada com sucesso!`);
        onClose();
    };
    
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-[#1e272e] rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 text-slate-300 font-sans">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b border-slate-700">
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
                           <ChevronLeftIcon className="w-6 h-6 text-slate-300"/>
                        </button>
                        <div className="flex items-center gap-4">
                           <input type="text" readOnly value={formattedDate} className="bg-slate-800 border border-slate-600 rounded-md py-1 px-3 text-sm text-center cursor-default" />
                           <select value={expenseType} onChange={e => setExpenseType(e.target.value)} className="bg-slate-800 border border-slate-600 rounded-md py-1 px-3 text-sm">
                                {mockExpenseTypes.map(type => <option key={type} value={type}>{type}</option>)}
                           </select>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <input type="text" placeholder="Descrição..." value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-transparent border-b-2 border-slate-600 focus:border-cyan-500 focus:outline-none" required/>
                        <input type="text" placeholder="Observação..." value={observation} onChange={e => setObservation(e.target.value)} className="w-full p-2 bg-transparent border-b-2 border-slate-600 focus:border-cyan-500 focus:outline-none"/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <label className="text-xs text-slate-400">Fornecedor:</label>
                                <div className="flex items-center gap-2">
                                    <select value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-sm">
                                        <option value="">Selecione</option>
                                        {mockSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button type="button" className="p-2 bg-slate-700 rounded-md hover:bg-slate-600"><RefreshIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                             <div>
                                <label className="text-xs text-slate-400">Categoria:</label>
                                <div className="flex items-center gap-2">
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-sm">
                                         <option value="">Selecione</option>
                                        {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                     <button type="button" className="p-2 bg-slate-700 rounded-md hover:bg-slate-600"><RefreshIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                             <div>
                                <label className="text-xs text-slate-400">Valor Unitário:</label>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-400">R$</span>
                                    <input type="number" step="0.01" value={unitValue || ''} onChange={e => setUnitValue(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-center"/>
                                </div>
                            </div>
                             <div>
                                <label className="text-xs text-slate-400">Quantidade:</label>
                                <input type="number" step="0.01" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-center"/>
                            </div>
                        </div>

                        <div className="text-center py-4 border-t border-b border-slate-700/50">
                            <span className="text-xl font-bold text-red-500">Total: {formatCurrency(total)}</span>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 items-end">
                            <div>
                                <label className="text-xs text-slate-400">Valor Pago: R$</label>
                                <div className="flex items-center gap-2">
                                   <input type="number" step="0.01" value={amountPaid || ''} onChange={e => setAmountPaid(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-sm"/>
                                   <button type="button" onClick={() => setAmountPaid(total)} className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-green-700">Tudo</button>
                                </div>
                            </div>
                             <div>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-sm">
                                    {mockPaymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                                </select>
                            </div>
                         </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4">
                        <button type="submit" className="w-full bg-slate-200 text-slate-900 font-bold py-3 rounded-lg hover:bg-white transition-colors text-lg">
                           Salvar Despesa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
