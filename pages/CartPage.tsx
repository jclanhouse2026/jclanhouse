
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import { useOrders } from '../context/OrderContext';
import { useNotifications } from '../context/NotificationContext';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import WhatsappIcon from '../components/icons/WhatsappIcon';
import { formatCurrency, safeToFixed } from '../lib/formatters';

// --- QuickBuyModal Component ---
const QuickBuyModal: React.FC<{
    onClose: () => void;
    onSubmit: (details: { name: string; phone: string; delivery: string }) => void;
}> = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [delivery, setDelivery] = useState('retirar');

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, phone, delivery });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">Finalizar Compra Rápida</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Seu Nome</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md" required />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">WhatsApp</label>
                            <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} className="w-full p-3 bg-slate-700 rounded-md" placeholder="(XX) XXXXX-XXXX" required />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Forma de Entrega</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setDelivery('retirar')} className={`p-3 rounded-md border-2 text-sm ${delivery === 'retirar' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-700 border-transparent'}`}>Retirar na Loja</button>
                                <button type="button" onClick={() => setDelivery('combinar')} className={`p-3 rounded-md border-2 text-sm ${delivery === 'combinar' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-700 border-transparent'}`}>Combinar Envio</button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                            <WhatsappIcon className="w-5 h-5" />
                            Confirmar e Enviar Pedido
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const CartPage: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { user } = useAuth();
    const { customers } = useCustomers();
    const { createOrder } = useOrders();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState('');

    const currentCustomer = useMemo(() => {
        return customers.find(c => c.userId === user?.id);
    }, [customers, user]);

    const totalCartPrice = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }, [cartItems]);

    const handlePlaceOrder = async () => {
        if (!user || !currentCustomer) return;
        
        if (!currentCustomer.address || !currentCustomer.address.street || !currentCustomer.address.number) {
            setOrderError('Por favor, complete seu endereço no perfil antes de finalizar o pedido.');
            setTimeout(() => navigate('/cliente/perfil'), 2000);
            return;
        }

        setIsPlacingOrder(true);
        setOrderError('');

        try {
            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                image: item.image,
                customization: item.customization
            }));

            await createOrder(
                orderItems,
                currentCustomer.address,
                totalCartPrice,
                currentCustomer.fullName || user.username || 'Cliente',
                currentCustomer.phone || ''
            );

            // Notify admin (mocked for now, but could be a real notification)
            // await addNotification('admin_id', 'Novo Pedido Recebido', `Um novo pedido de ${currentCustomer.fullName} foi realizado.`, 'info');
            
            // Notify user
            await addNotification(user.id, 'Pedido Realizado!', 'Seu pedido foi recebido e está aguardando processamento.', 'success');

            clearCart();
            navigate('/cliente/pedidos');
        } catch (err) {
            console.error("Erro ao realizar pedido:", err);
            setOrderError('Ocorreu um erro ao processar seu pedido. Tente novamente.');
        } finally {
            setIsPlacingOrder(false);
        }
    };
    
    const handleQuickBuySubmit = (details: { name: string; phone: string; delivery: string }) => {
        const phoneNumber = '5594991083745';
        
        let message = `Olá! Gostaria de fazer um pedido (Compra Rápida).\n\n`;
        message += `*DADOS DO CLIENTE:*\n`;
        message += `*Nome:* ${details.name}\n`;
        message += `*WhatsApp:* ${details.phone}\n`;
        message += `*Entrega:* ${details.delivery === 'retirar' ? 'Retirar na loja' : 'Combinar envio pelo WhatsApp'}\n\n`;
        
        message += `*ITENS DO PEDIDO:*\n`;
        message += `--------------------\n`;

        cartItems.forEach((item, index) => {
            message += `*${index + 1}. ${item.name}*\n`;
            message += `   - Quantidade: ${item.quantity}\n`;
            if (item.customization?.text) {
                 message += `   - Personalização: "${item.customization.text}"\n`;
            }
             if (item.customization?.image) {
                 message += `   - Imagem Anexada: Sim\n`;
            }
            message += `   - Preço Unit.: ${formatCurrency(item.unitPrice)}\n`;
            message += `   - Subtotal: ${formatCurrency(item.totalPrice)}\n\n`;
        });

        message += `--------------------\n`;
        message += `*VALOR TOTAL:* ${formatCurrency(totalCartPrice)}\n\n`;
        message += `Aguardo o contato para finalizar. Obrigado!`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        clearCart();
        setIsModalOpen(false);
        window.open(whatsappUrl, '_blank');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <ShoppingCartIcon className="w-8 h-8" />
                    Seu Carrinho
                </h1>

                {cartItems.length === 0 ? (
                    <div className="text-center bg-slate-800 p-12 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-semibold text-slate-300">Seu carrinho está vazio.</h2>
                        <p className="text-slate-400 mt-2">Adicione produtos para vê-los aqui.</p>
                        <Link to="/portfolio" className="mt-6 inline-block bg-cyan-500 text-white font-bold py-3 px-6 rounded-md hover:bg-cyan-600">
                            Ver Produtos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-start gap-4 border-b border-slate-700 pb-4 last:border-b-0">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 rounded-md object-cover bg-white" />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-white">{item.name}</h3>
                                        <p className="text-sm text-slate-400">Preço: {formatCurrency(item.unitPrice)}</p>
                                         {item.customization?.text && <p className="text-xs text-slate-400 italic">"{item.customization.text}"</p>}
                                        {item.customization?.image && <p className="text-xs text-cyan-400">Com imagem anexada</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2 bg-slate-700 rounded-md">
                                             <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 text-lg font-bold text-cyan-400">-</button>
                                            <span className="w-8 text-center text-md font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 text-lg font-bold text-cyan-400">+</button>
                                        </div>
                                        <p className="font-bold text-lg">{formatCurrency(item.totalPrice)}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:underline">
                                           Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-1 bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 sticky top-24">
                            <h2 className="text-xl font-bold border-b border-slate-700 pb-3 mb-4">Resumo do Pedido</h2>
                            <div className="flex justify-between text-slate-300">
                                <p>Subtotal</p>
                                <p>{formatCurrency(totalCartPrice)}</p>
                            </div>
                            <div className="flex justify-between text-lg font-bold mt-4">
                                <p>Total</p>
                                <p>{formatCurrency(totalCartPrice)}</p>
                            </div>
                            <div className="mt-6 space-y-3">
                                {user ? (
                                    <>
                                        <button 
                                            onClick={handlePlaceOrder} 
                                            disabled={isPlacingOrder}
                                            className="w-full bg-cyan-600 text-white font-bold py-3 rounded-md hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isPlacingOrder ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : null}
                                            Finalizar Pedido
                                        </button>
                                        {orderError && <p className="text-xs text-red-400 text-center mt-2">{orderError}</p>}
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsModalOpen(true)} className="w-full bg-cyan-500 text-white font-bold py-3 rounded-md hover:bg-cyan-600 transition-colors">
                                            Finalizar Compra Rápida
                                        </button>
                                        <Link to="/login" className="w-full block text-center bg-slate-700 text-white font-bold py-3 rounded-md hover:bg-slate-600 transition-colors">
                                            Fazer Login ou Cadastrar
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
            {isModalOpen && <QuickBuyModal onClose={() => setIsModalOpen(false)} onSubmit={handleQuickBuySubmit} />}
        </div>
    );
};

export default CartPage;
