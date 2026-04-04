import React, { useState, useMemo } from 'react';
import type { PortfolioProduct, Customer } from '../../types';
import { usePortfolio } from '../../context/PortfolioContext';
import { useSales, Sale } from '../../context/SalesContext';
import { formatCurrency } from '../../lib/formatters';
import CustomerModal from './CustomerModal';

// Icon imports
import ShoppingCartIcon from '../icons/ShoppingCartIcon';
import SearchIcon from '../icons/SearchIcon';
import TrashIcon from '../icons/TrashIcon';
import TagIcon from '../icons/TagIcon';
import XCircleIcon from '../icons/XCircleIcon';
import CashIcon from '../icons/CashIcon';
import CreditCardIcon from '../icons/CreditCardIcon';
import PixIcon from '../icons/PixIcon';
import PrinterIcon from '../icons/PrinterIcon';
import CheckBadgeIcon from '../icons/CheckBadgeIcon';

type SaleCartItem = { id: number; name: string; quantity: number; unitPrice: number };
type SaleStep = 'cart' | 'payment' | 'receipt';
type PaymentMethod = 'cash' | 'card' | 'pix' | null;

const PaymentButton: React.FC<{icon: React.ElementType, label: string, active: boolean, onClick: () => void}> = ({ icon: Icon, label, active, onClick}) => (
    <button onClick={onClick} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-colors ${active ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-700/50 border-slate-700 hover:border-slate-500'}`}>
        <Icon className={`w-8 h-8 ${active ? 'text-cyan-400' : 'text-slate-300'}`} />
        <span className={`font-semibold text-sm ${active ? 'text-white' : 'text-slate-300'}`}>{label}</span>
    </button>
);


const SaleModal: React.FC<{ 
    onClose: () => void; 
    onSaleComplete: (sale: Sale) => void;
    customers: Customer[];
    addCustomer: (c: Omit<Customer, 'id' | 'userId' | 'signupDate' | 'status'>) => Promise<Customer>;
}> = ({ onClose, onSaleComplete, customers, addCustomer }) => {
    const { products } = usePortfolio();
    const { addSale: saveSaleToContext } = useSales();
    const [step, setStep] = useState<SaleStep>('cart');
    const [cart, setCart] = useState<SaleCartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [amountPaid, setAmountPaid] = useState<number>(0);
    
    // Customer state
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Discount state
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
    const [discountValue, setDiscountValue] = useState<number>(0);
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
    }, [searchTerm, products]);
    
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0), [cart]);
    const discountAmount = useMemo(() => {
        if (discountValue <= 0) return 0;
        if (discountType === 'percent') {
            return subtotal * (discountValue / 100);
        }
        return Math.min(subtotal, discountValue); // Discount can't be more than subtotal
    }, [subtotal, discountType, discountValue]);
    const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

    const change = useMemo(() => (paymentMethod === 'cash' && amountPaid > total) ? amountPaid - total : 0, [amountPaid, total, paymentMethod]);

    const handleConfirmPayment = async () => {
        const saleData = {
            customerName: selectedCustomer?.fullName || 'Sem Cadastro',
            phone: selectedCustomer?.phone || '',
            total: total,
            amountPaid: paymentMethod === 'cash' ? amountPaid : total,
            paymentMethod: paymentMethod || 'N/A',
            items: cart.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: 0, // Individual item discount not implemented yet
                observation: ''
            }))
        };
        const newSale = await saveSaleToContext(saleData);
        onSaleComplete(newSale);
        setStep('receipt');
    };

    const addToCart = (product: PortfolioProduct) => {
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
    
    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => {
            const updatedCart = prev.map(item => 
                item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
            );
            return updatedCart.filter(item => item.quantity > 0); // Remove item if quantity is 0
        });
    };
    
    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const resetSale = () => {
        setCart([]);
        setSearchTerm('');
        setPaymentMethod(null);
        setAmountPaid(0);
        setSelectedCustomer(null);
        setDiscountValue(0);
        setStep('cart');
    };

    const handleSelectCustomer = (customer: Customer | null) => {
        setSelectedCustomer(customer);
        setIsCustomerModalOpen(false);
    }
    
    const handleAddNewCustomer = async (customerData: { fullName: string; phone: string; }) => {
        const newCustomer = await addCustomer(customerData); // This now returns the new customer
        setSelectedCustomer(newCustomer);
        setIsCustomerModalOpen(false);
    }

    const renderCartStep = () => (
        <>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-700">
                 <div className="bg-slate-900 rounded-md p-3 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400">Cliente</p>
                        <p className="font-bold">{selectedCustomer?.fullName || 'Sem Cadastro'}</p>
                    </div>
                    <button onClick={() => setIsCustomerModalOpen(true)} className="bg-cyan-600 text-white text-xs font-bold py-2 px-3 rounded-md hover:bg-cyan-700">
                        Buscar / Add
                    </button>
                </div>
                <div className="relative">
                    <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar produto por nome..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-md py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                     {filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-600 mt-1 rounded-md shadow-lg z-10">
                            {filteredProducts.map(p => (
                                <div key={p.id} onClick={() => addToCart(p)} className="p-3 hover:bg-slate-600 cursor-pointer text-sm">
                                    {p.name} - {formatCurrency(typeof p.promoPrice === 'number' ? p.promoPrice : p.originalPrice)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="text-center text-slate-400 pt-16">
                        <ShoppingCartIcon className="w-16 h-16 mx-auto opacity-30"/>
                        <p className="mt-4">O carrinho está vazio</p>
                        <p className="text-sm">Busque e adicione produtos para iniciar a venda.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-slate-700/50 p-2 rounded-md">
                                <div className="flex-grow">
                                    <p className="font-semibold text-white">{item.name}</p>
                                    <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} / un.</p>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-800 rounded-md p-1">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 font-bold text-cyan-400">-</button>
                                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 font-bold text-cyan-400">+</button>
                                </div>
                                <p className="w-24 text-right font-bold text-lg">{formatCurrency(item.quantity * item.unitPrice)}</p>
                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
             <div className="p-4 bg-slate-900/50 border-t border-slate-700 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                         <TagIcon className="w-4 h-4 text-slate-400"/>
                         <span className="text-slate-400">Desconto</span>
                         <div className="flex items-center bg-slate-800 rounded-md">
                            <button onClick={() => setDiscountType('fixed')} className={`px-2 py-1 text-xs rounded-l-md ${discountType === 'fixed' ? 'bg-cyan-500 text-white' : ''}`}>R$</button>
                            <button onClick={() => setDiscountType('percent')} className={`px-2 py-1 text-xs rounded-r-md ${discountType === 'percent' ? 'bg-cyan-500 text-white' : ''}`}>%</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <input 
                            type="number"
                            value={discountValue || ''}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            className="w-20 bg-slate-700 p-1 rounded-md text-right font-semibold border border-slate-600"
                        />
                         <span className="font-semibold text-red-400">(- {formatCurrency(discountAmount)})</span>
                    </div>
                </div>
                 <div className="flex justify-between items-center text-2xl font-bold border-t border-slate-700 pt-3 mt-3">
                    <span className="text-white">Total</span>
                    <span className="text-cyan-400">{formatCurrency(total)}</span>
                </div>
                <button onClick={() => setStep('payment')} disabled={cart.length === 0} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                    IR PARA PAGAMENTO
                </button>
            </div>
            {isCustomerModalOpen && <CustomerModal customers={customers} onSelect={handleSelectCustomer} onAdd={handleAddNewCustomer} onClose={() => setIsCustomerModalOpen(false)} />}
        </>
    );

    const renderPaymentStep = () => (
         <>
            <div className="p-4 border-b border-slate-700 text-center">
                <p className="text-sm text-slate-400">Valor Total a Pagar</p>
                <p className="text-5xl font-bold text-cyan-400">{formatCurrency(total)}</p>
            </div>
            <div className="p-6 flex-grow space-y-6">
                 <h3 className="text-center font-bold text-white">Selecione a forma de pagamento</h3>
                 <div className="grid grid-cols-3 gap-4">
                     <PaymentButton icon={CashIcon} label="Dinheiro" active={paymentMethod === 'cash'} onClick={() => setPaymentMethod('cash')} />
                     <PaymentButton icon={CreditCardIcon} label="Cartão" active={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')} />
                     <PaymentButton icon={PixIcon} label="PIX" active={paymentMethod === 'pix'} onClick={() => setPaymentMethod('pix')} />
                 </div>
                 {paymentMethod === 'cash' && (
                     <div className="bg-slate-700/50 p-4 rounded-lg">
                        <label className="text-sm font-bold text-slate-300 block mb-2">Valor Recebido</label>
                        <input type="number" value={amountPaid || ''} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} placeholder="Ex: 50.00" className="w-full p-3 bg-slate-900 rounded-md text-2xl text-center"/>
                        {change > 0 && (
                            <div className="mt-3 text-center">
                                <p className="text-sm text-slate-400">Troco</p>
                                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(change)}</p>
                            </div>
                        )}
                     </div>
                 )}
            </div>
             <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-4">
                <button onClick={() => setStep('cart')} className="w-1/3 bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700">Voltar</button>
                <button onClick={handleConfirmPayment} disabled={!paymentMethod || (paymentMethod === 'cash' && amountPaid < total)} className="w-2/3 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed">
                    CONFIRMAR PAGAMENTO
                </button>
            </div>
        </>
    );

    const renderReceiptStep = () => (
        <div className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckBadgeIcon className="w-12 h-12 text-green-400"/>
            </div>
            <h2 className="text-2xl font-bold text-white">Venda Finalizada!</h2>
            <div className="my-6 w-full max-w-sm bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between text-lg"><span className="text-slate-400">Total:</span> <span className="font-bold">{formatCurrency(total)}</span></div>
                {paymentMethod === 'cash' && <div className="flex justify-between"><span className="text-slate-400">Recebido:</span> <span>{formatCurrency(amountPaid)}</span></div>}
                {change > 0 && <div className="flex justify-between text-emerald-400"><span className="text-slate-400">Troco:</span> <span className="font-bold">{formatCurrency(change)}</span></div>}
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-700"><span className="text-slate-400">Pagamento:</span> <span className="font-bold capitalize">{paymentMethod}</span></div>
            </div>
             <div className="mt-auto w-full flex gap-4">
                <button onClick={onClose} className="w-1/3 bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700">Fechar</button>
                <button onClick={() => alert("Função de impressão já foi aberta.")} className="w-1/3 bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"><PrinterIcon className="w-5 h-5"/> Imprimir</button>
                <button onClick={resetSale} className="w-1/3 bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700">Nova Venda</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] border border-slate-700 flex flex-col">
                 <div className="flex justify-between items-center p-3 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-white">Ponto de Venda</h2>
                    <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                </div>
                {step === 'cart' && renderCartStep()}
                {step === 'payment' && renderPaymentStep()}
                {step === 'receipt' && renderReceiptStep()}
            </div>
        </div>
    );
};

export default SaleModal;
