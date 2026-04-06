import React, { useState, useMemo, useRef } from 'react';
import { useSales, Sale } from '../../../context/SalesContext';
import { usePortfolio } from '../../../context/PortfolioContext';
import { useCompany } from '../../../context/CompanyContext';
import { formatCurrency } from '../../../lib/formatters';
import SearchIcon from '../../icons/SearchIcon';
import TrashIcon from '../../icons/TrashIcon';
import CheckBadgeIcon from '../../icons/CheckBadgeIcon';
import DocumentTextIcon from '../../icons/DocumentTextIcon';
import PrinterIcon from '../../icons/PrinterIcon';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const OrcamentosModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { addSale } = useSales();
    const { products } = usePortfolio();
    const { companyInfo } = useCompany();
    const receiptRef = useRef<HTMLDivElement>(null);
    
    const [cart, setCart] = useState<{ id: string; name: string; quantity: number; unitPrice: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerName, setCustomerName] = useState('');
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
    }, [searchTerm, products]);

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0), [cart]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            const unitPrice = typeof product.promoPrice === 'number' ? product.promoPrice : product.originalPrice;
            return [...prev, { id: product.id, name: product.name, quantity: 1, unitPrice }];
        });
        setSearchTerm('');
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const updateUnitPrice = (id: string, newPrice: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, unitPrice: Math.max(0, newPrice) };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleSaveQuote = async () => {
        if (cart.length === 0) return alert('Adicione itens ao orçamento.');
        
        await addSale({
            customerName: customerName || 'Cliente Balcão',
            phone: '',
            total: subtotal,
            items: cart.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: 0,
                observation: ''
            })),
            status: 'orcamento'
        });
        alert('Orçamento salvo com sucesso!');
        setCart([]);
        setCustomerName('');
    };

    const handleConvertToOrder = async () => {
        if (cart.length === 0) return alert('Adicione itens ao pedido.');
        
        await addSale({
            customerName: customerName || 'Cliente Balcão',
            phone: '',
            total: subtotal,
            items: cart.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: 0,
                observation: ''
            })),
            status: 'em_aberto'
        });
        alert('Convertido em pedido com sucesso!');
        setCart([]);
        setCustomerName('');
    };

    const handleExportPDF = async () => {
        if (cart.length === 0) return alert('Adicione itens ao orçamento.');
        if (!receiptRef.current) return;
        
        // Temporarily show the receipt div for rendering
        receiptRef.current.style.display = 'block';
        
        const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`orcamento_${customerName || 'cliente'}.pdf`);
        
        // Hide it again
        receiptRef.current.style.display = 'none';
    };

    return (
        <div className="bg-[#1e272e] rounded-xl p-6 border border-slate-700 min-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-cyan-400" />
                    Orçamentos
                </h2>
                <button onClick={onBack} className="text-slate-400 hover:text-white">Voltar</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                {/* Left side: Search and Cart */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar produto ou serviço..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500"
                        />
                        {filteredProducts.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-700 flex justify-between items-center border-b border-slate-700/50 last:border-0"
                                    >
                                        <span className="text-white">{product.name}</span>
                                        <span className="text-cyan-400 font-medium">
                                            {formatCurrency(typeof product.promoPrice === 'number' ? product.promoPrice : product.originalPrice)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 flex-grow overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <DocumentTextIcon className="w-12 h-12 mb-2 opacity-20" />
                                <p>Nenhum item no orçamento</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
                                        <div className="flex-grow">
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-white font-medium">{item.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-400">R$</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateUnitPrice(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-cyan-400 focus:outline-none focus:border-cyan-500"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-600">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-slate-300 hover:text-white">-</button>
                                                <input 
                                                    type="number" 
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    className="w-12 bg-transparent text-center text-white font-medium focus:outline-none"
                                                    min="1"
                                                />
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-slate-300 hover:text-white">+</button>
                                            </div>
                                            <div className="text-right min-w-[5rem]">
                                                <div className="text-white font-bold">{formatCurrency(item.unitPrice * item.quantity)}</div>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Summary and Actions */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4">Resumo do Orçamento</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Cliente</label>
                        <input 
                            type="text" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="flex-grow"></div>

                    <div className="border-t border-slate-700 pt-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">Subtotal</span>
                            <span className="text-white">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold mt-4">
                            <span className="text-white">Total</span>
                            <span className="text-cyan-400">{formatCurrency(subtotal)}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleSaveQuote}
                            disabled={cart.length === 0}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Salvar Orçamento
                        </button>
                        <button 
                            onClick={handleExportPDF}
                            disabled={cart.length === 0}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            Exportar PDF
                        </button>
                        <button 
                            onClick={handleConvertToOrder}
                            disabled={cart.length === 0}
                            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckBadgeIcon className="w-5 h-5" />
                            Converter em Pedido
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Receipt for PDF Generation */}
            <div ref={receiptRef} style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: 'white', color: 'black' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{companyInfo.name}</h1>
                    <p style={{ margin: '5px 0', color: '#666' }}>{companyInfo.phone}</p>
                    <p style={{ margin: '5px 0', color: '#666' }}>{companyInfo.email}</p>
                    <h2 style={{ fontSize: '20px', marginTop: '20px', color: '#333' }}>ORÇAMENTO</h2>
                    <p style={{ margin: '5px 0', color: '#666' }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Cliente:</strong> {customerName || 'Não informado'}</p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px', color: '#666' }}>Item</th>
                            <th style={{ padding: '10px', color: '#666', textAlign: 'center' }}>Qtd</th>
                            <th style={{ padding: '10px', color: '#666', textAlign: 'right' }}>V. Unitário</th>
                            <th style={{ padding: '10px', color: '#666', textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{item.name}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.unitPrice * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <div style={{ width: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #eee', fontWeight: 'bold', fontSize: '18px' }}>
                            <span>TOTAL:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '50px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                    <p>Este orçamento é válido por 15 dias.</p>
                </div>
            </div>
        </div>
    );
};

export default OrcamentosModule;
