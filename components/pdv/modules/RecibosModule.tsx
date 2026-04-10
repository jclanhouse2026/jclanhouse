import React, { useState, useRef } from 'react';
import { useSales, Sale } from '../../../context/SalesContext';
import { formatCurrency } from '../../../lib/formatters';
import ReceiptIcon from '../../icons/ReceiptIcon';
import PrinterIcon from '../../icons/PrinterIcon';
import DocumentTextIcon from '../../icons/DocumentTextIcon';
import { useCompany } from '../../../context/CompanyContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const RecibosModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { sales } = useSales();
    const { companyInfo } = useCompany();
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    const finalizedSales = sales.filter(s => s.status === 'finalizado');

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!receiptRef.current) return;
        
        const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a5');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`recibo_${selectedSale?.id}.pdf`);
    };

    return (
        <div className="bg-[#1e272e] rounded-xl p-6 border border-slate-700 min-h-[80vh] flex flex-col print:bg-white print:p-0 print:border-none">
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ReceiptIcon className="w-6 h-6 text-cyan-400" />
                    Recibos
                </h2>
                <button onClick={onBack} className="text-slate-400 hover:text-white">Voltar</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow print:block">
                {/* Left side: List of sales */}
                <div className="lg:col-span-1 bg-slate-800 rounded-lg border border-slate-700 p-4 overflow-y-auto max-h-[70vh] print:hidden">
                    <h3 className="text-lg font-bold text-white mb-4">Vendas Finalizadas</h3>
                    <div className="space-y-2">
                        {finalizedSales.length === 0 ? (
                            <p className="text-slate-500 text-sm">Nenhuma venda finalizada.</p>
                        ) : (
                            finalizedSales.map(sale => (
                                <button
                                    key={sale.id}
                                    onClick={() => setSelectedSale(sale)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                        selectedSale?.id === sale.id 
                                            ? 'bg-cyan-600/20 border-cyan-500' 
                                            : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                                    }`}
                                >
                                    <div className="font-bold text-white truncate">{sale.customerName}</div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-slate-400">{new Date(sale.dateTime).toLocaleDateString('pt-BR')}</span>
                                        <span className="text-cyan-400 font-medium">{formatCurrency(sale.total)}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right side: Receipt view */}
                <div className="lg:col-span-2 flex flex-col items-center print:w-full print:block">
                    {selectedSale ? (
                        <div className="w-full max-w-md">
                            <div className="flex gap-2 mb-4 justify-end print:hidden">
                                <button onClick={handlePrint} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Imprimir">
                                    <PrinterIcon className="w-5 h-5" />
                                </button>
                                <button onClick={handleDownloadPDF} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Salvar PDF">
                                    <DocumentTextIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div ref={receiptRef} className="bg-white text-black p-6 rounded-lg shadow-lg print:shadow-none print:p-0">
                                <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
                                    <h2 className="text-xl font-bold uppercase">{companyInfo.name}</h2>
                                    <p className="text-sm text-gray-600">{companyInfo.phone}</p>
                                    <p className="text-sm text-gray-600">{companyInfo.email}</p>
                                    <div className="mt-4 text-sm">
                                        <p><strong>RECIBO DE VENDA</strong></p>
                                        <p className="text-gray-500">{new Date(selectedSale.dateTime).toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>

                                <div className="mb-4 text-sm">
                                    <p><strong>Cliente:</strong> {selectedSale.customerName}</p>
                                    {selectedSale.phone && <p><strong>Telefone:</strong> {selectedSale.phone}</p>}
                                </div>

                                <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500">
                                                <th className="pb-2 font-normal">Qtd</th>
                                                <th className="pb-2 font-normal">Item</th>
                                                <th className="pb-2 font-normal text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSale.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-1 align-top">{item.quantity}</td>
                                                    <td className="py-1">{item.productName}</td>
                                                    <td className="py-1 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>TOTAL</span>
                                        <span>{formatCurrency(selectedSale.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Pagamento</span>
                                        <span className="uppercase">{selectedSale.paymentMethod}</span>
                                    </div>
                                    {selectedSale.amountPaid && selectedSale.amountPaid > selectedSale.total && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Troco</span>
                                            <span>{formatCurrency(selectedSale.amountPaid - selectedSale.total)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 text-center text-sm text-gray-500 border-t border-dashed border-gray-300 pt-4">
                                    <p>Obrigado pela preferência!</p>
                                    <p className="mt-1 text-xs">Volte sempre.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 print:hidden">
                            <ReceiptIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>Selecione uma venda para visualizar o recibo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecibosModule;
