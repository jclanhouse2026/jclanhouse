
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useThemes } from '../context/ThemeContext';
import { useCompany } from '../context/CompanyContext';
import { generateOrderNumber } from '../lib/orderUtils';
import ImageModal from '../components/ImageModal';
import { Maximize2 } from 'lucide-react';
import type { Theme } from '../types';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import UserIcon from '../components/icons/UserIcon';
import HashtagIcon from '../components/icons/HashtagIcon';

const MugOrderPage: React.FC = () => {
    const { themeId } = useParams<{ themeId: string }>();
    const navigate = useNavigate();
    const { themes, addThemeOrder } = useThemes();
    const { companyInfo } = useCompany();
    
    const [theme, setTheme] = useState<Theme | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    useEffect(() => {
        if (themeId) {
            const foundTheme = themes.find(t => t.id === themeId);
            if (foundTheme) {
                setTheme(foundTheme);
            } else {
                navigate('/temas-canecas');
            }
        }
    }, [themeId, themes, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!theme) return;

        setIsSubmitting(true);
        try {
            const orderNumber = generateOrderNumber();
            await addThemeOrder({
                customerName: name,
                customerPhone: phone,
                orderNumber: orderNumber,
                themeId: theme.id,
                themeName: theme.name,
                themeImageUrl: theme.imageUrl,
                productType: 'caneca'
            });

            setIsSuccess(true);
            
            // Send WhatsApp message
            const message = `Olá! Acabei de escolher um tema de caneca no site.\n\n*Detalhes do Pedido:*\n- *Nome:* ${name}\n- *Telefone:* ${phone}\n- *Número do Pedido:* ${orderNumber}\n- *Tema Escolhido:* ${theme.name}\n\nPor favor, aguardo o retorno para prosseguir com a produção.`;
            const whatsappUrl = `https://wa.me/${companyInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            
            // Wait a bit to show success message before redirecting to WhatsApp
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 2000);

        } catch (error) {
            console.error("Erro ao enviar pedido:", error);
            alert("Erro ao enviar pedido. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!theme) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Header />
            <main className="flex-grow py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Theme Preview */}
                            <div className="bg-slate-900 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-700">
                                <h2 className="text-xl font-bold mb-6 text-cyan-400">Tema Selecionado</h2>
                                <div className="aspect-square w-full max-w-[300px] rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 group cursor-pointer relative" onClick={() => setIsZoomOpen(true)}>
                                    <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                                            <Maximize2 className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">{theme.category}</p>
                                    <h3 className="text-2xl font-extrabold mt-1">{theme.name}</h3>
                                </div>
                            </div>

                            {/* Order Form */}
                            <div className="p-8">
                                {isSuccess ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                                        <div className="bg-green-500/20 p-4 rounded-full">
                                            <CheckCircleIcon className="w-16 h-16 text-green-500" />
                                        </div>
                                        <h2 className="text-3xl font-bold">Pedido Enviado!</h2>
                                        <p className="text-slate-400">Seu pedido foi registrado com sucesso. Você será redirecionado para o WhatsApp em instantes...</p>
                                        <button 
                                            onClick={() => navigate('/temas-canecas')}
                                            className="mt-6 text-cyan-500 font-bold hover:underline"
                                        >
                                            Voltar para Temas
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-bold">Finalizar Escolha</h2>
                                            <p className="text-slate-400 mt-2">Preencha seus dados para que possamos identificar seu pedido.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4" /> Nome Completo
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                                    placeholder="Seu nome"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                                                    <PhoneIcon className="w-4 h-4" /> WhatsApp / Telefone
                                                </label>
                                                <input 
                                                    type="tel" 
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                                    placeholder="(00) 00000-0000"
                                                    required
                                                />
                                            </div>

                                            <button 
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {isSubmitting ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                ) : (
                                                    <>FINALIZAR E ENVIAR WHATSAPP</>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <ImageModal 
                isOpen={isZoomOpen} 
                onClose={() => setIsZoomOpen(false)} 
                imageUrl={theme.imageUrl} 
                title={theme.name} 
            />
        </div>
    );
};

export default MugOrderPage;
