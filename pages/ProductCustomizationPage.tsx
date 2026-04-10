import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SparklesIcon from '../components/icons/SparklesIcon';
import { useThemes } from '../context/ThemeContext';
import { useServicePricing } from '../context/ServicePricingContext';
import { useCompany } from '../context/CompanyContext';
import { formatCurrency } from '../lib/formatters';
import { generateOrderNumber } from '../lib/orderUtils';
import ImageModal from '../components/ImageModal';
import { Maximize2 } from 'lucide-react';
import UserIcon from '../components/icons/UserIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import HashtagIcon from '../components/icons/HashtagIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

const ProductCustomizationPage: React.FC = () => {
    const { themeId } = useParams<{ themeId: string }>();
    const { themes, addThemeOrder } = useThemes();
    const { pricing, loading: pricingLoading } = useServicePricing();
    const { companyInfo } = useCompany();
    const navigate = useNavigate();
    const { caderneta: cadernetaPricing } = pricing;

    const theme = useMemo(() => {
        return themes.find(t => t.id.toString() === themeId);
    }, [themes, themeId]);
    
    const [childName, setChildName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [motherPhone, setMotherPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [selectedMainOption, setSelectedMainOption] = useState(cadernetaPricing.mainOptions[0]);
    const [selectedAddons, setSelectedAddons] = useState<typeof cadernetaPricing.luxuryAddons[0][]>([]);
    
    useEffect(() => {
        if (!pricingLoading && cadernetaPricing.mainOptions.length > 0) {
            setSelectedMainOption(cadernetaPricing.mainOptions[0]);
        }
    }, [pricingLoading, cadernetaPricing.mainOptions]);

    const totalPrice = useMemo(() => {
        if (!selectedMainOption) return 0;
        const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        return selectedMainOption.price + addonsTotal;
    }, [selectedMainOption, selectedAddons]);

    const handleAddonToggle = (addon: typeof cadernetaPricing.luxuryAddons[0]) => {
        setSelectedAddons(prev => 
            prev.some(a => a.id === addon.id)
                ? prev.filter(a => a.id !== addon.id)
                : [...prev, addon]
        );
    };

    const handleAddToCart = async () => {
        if (!theme || !selectedMainOption || !motherName || !motherPhone) return;

        setIsSubmitting(true);
        try {
            const orderNumber = generateOrderNumber();
            const addonsText = selectedAddons.length > 0 
                ? ` + Adicionais: ${selectedAddons.map(a => a.name).join(', ')}` 
                : '';
            
            const customizationDetails = `Nome da Criança: ${childName || 'Não informado'} | Opção: ${selectedMainOption.name}${addonsText}`;

            await addThemeOrder({
                customerName: motherName,
                customerPhone: motherPhone,
                orderNumber: orderNumber,
                themeId: theme.id,
                themeName: theme.name,
                themeImageUrl: theme.imageUrl,
                productType: 'caderneta',
                customizationDetails: customizationDetails
            });

            setIsSuccess(true);

            // Send WhatsApp message
            const message = `Olá! Acabei de fazer um pedido de Caderneta no site.\n\n*Detalhes do Pedido:*\n- *Nome da Mãe:* ${motherName}\n- *Telefone:* ${motherPhone}\n- *Número do Pedido:* ${orderNumber || 'S/N'}\n- *Tema Escolhido:* ${theme.name}\n- *Detalhes:* ${customizationDetails}\n- *Valor Total:* ${formatCurrency(totalPrice)}\n\nPor favor, aguardo o retorno para prosseguir com a produção.`;
            const whatsappUrl = `https://wa.me/${companyInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            
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

    if (pricingLoading) {
        return <div className="min-h-screen bg-slate-900 text-white text-center p-8">Carregando...</div>
    }

    if (!cadernetaPricing || !cadernetaPricing.mainOptions || cadernetaPricing.mainOptions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Serviço Indisponível</h2>
                        <p className="text-slate-400 mb-6">Os preços para este serviço ainda não foram configurados pelo administrador.</p>
                        <Link to="/caderneta" className="text-cyan-500 hover:text-cyan-400 font-bold">Voltar para Temas</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!theme) {
        return (
             <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-2xl font-bold">Tema não encontrado</h1>
                    <Link to="/caderneta" className="mt-4 inline-block bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Voltar para a seleção de temas</Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Voltar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Column: Preview & Price */}
                        <div className="space-y-6 lg:space-y-8 lg:sticky top-28 h-max">
                            <div className="relative aspect-[4/5] w-full max-w-sm sm:max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700 group cursor-pointer" onClick={() => setIsZoomOpen(true)}>
                               <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                                        <Maximize2 className="w-8 h-8 text-white" />
                                    </div>
                               </div>
                               <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-8 pointer-events-none">
                                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg text-center text-slate-800 shadow-xl w-full">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">PREVIEW DA CAPA</p>
                                        <h2 className="text-2xl sm:text-3xl font-bold my-2 break-words">{childName || 'NOME DA CRIANÇA'}</h2>
                                        <p className="text-xs font-bold text-slate-500">TEMA: {theme.name.toUpperCase()}</p>
                                    </div>
                               </div>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 flex justify-between items-center shadow-lg border border-slate-700 max-w-sm sm:max-w-lg mx-auto w-full">
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-400">TOTAL DO ITEM</p>
                                    <p className="text-2xl sm:text-4xl font-bold text-white">{formatCurrency(totalPrice)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm text-slate-400">UNITÁRIO</p>
                                    <p className="text-base sm:text-lg font-semibold text-slate-300">{formatCurrency(selectedMainOption?.price || 0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Options */}
                        <div className="space-y-8">
                            {isSuccess ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                                    <div className="bg-green-500/20 p-4 rounded-full">
                                        <CheckCircleIcon className="w-16 h-16 text-green-500" />
                                    </div>
                                    <h2 className="text-3xl font-bold">Pedido Enviado!</h2>
                                    <p className="text-slate-400">Seu pedido foi registrado com sucesso. Você será redirecionado para o WhatsApp em instantes...</p>
                                    <button 
                                        onClick={() => navigate('/caderneta')}
                                        className="mt-6 text-orange-500 font-bold hover:underline"
                                    >
                                        Voltar para Temas
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">{theme.name.toUpperCase()}</h1>
                                        <p className="text-slate-400 mt-2">Acabamento de luxo com laminação de alta resistência.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-300 block"><span className="text-orange-400 mr-2">1.</span>NOME DA CRIANÇA (CAPA)</label>
                                        <input
                                            type="text"
                                            value={childName}
                                            onChange={(e) => setChildName(e.target.value)}
                                            placeholder="DIGITE O NOME COMPLETO"
                                            className="w-full p-4 bg-slate-800 rounded-md text-white border border-slate-700 focus:border-orange-500 focus:ring-orange-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-300"><span className="text-orange-400 mr-2">2.</span>O QUE VOCÊ PRECISA?</h3>
                                        <div className="space-y-3">
                                            {cadernetaPricing.mainOptions.map((option: any) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setSelectedMainOption(option)}
                                                    className={`w-full flex justify-between items-center p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                                        selectedMainOption?.id === option.id ? 'bg-orange-500/10 border-orange-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                                                    }`}
                                                >
                                                    <span className={`font-semibold ${selectedMainOption?.id === option.id ? 'text-orange-300' : 'text-white'}`}>{option.name}</span>
                                                    <span className={`font-bold ${selectedMainOption?.id === option.id ? 'text-white' : 'text-slate-300'}`}>{formatCurrency(option.price)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-orange-400" /><span className="text-orange-400 mr-1">3.</span>ADICIONAIS DE LUXO</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {cadernetaPricing.luxuryAddons.map((addon: any) => (
                                                <button
                                                    key={addon.id}
                                                    onClick={() => handleAddonToggle(addon)}
                                                    className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-200 text-sm ${
                                                        selectedAddons.some(a => a.id === addon.id) ? 'bg-orange-500/10 border-orange-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                                                    }`}
                                                >
                                                    <p className={`font-semibold ${selectedAddons.some(a => a.id === addon.id) ? 'text-white' : 'text-slate-300'}`}>{addon.name}</p>
                                                    <p className={`font-bold text-xs ${selectedAddons.some(a => a.id === addon.id) ? 'text-orange-300' : 'text-slate-400'}`}>+ {formatCurrency(addon.price)}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-300"><span className="text-orange-400 mr-2">4.</span>SEUS DADOS</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-2">
                                                    <UserIcon className="w-3 h-3" /> Nome da Mãe / Responsável
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={motherName}
                                                    onChange={(e) => setMotherName(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                                    placeholder="Seu nome"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-2">
                                                    <PhoneIcon className="w-3 h-3" /> WhatsApp
                                                </label>
                                                <input 
                                                    type="tel" 
                                                    value={motherPhone}
                                                    onChange={(e) => setMotherPhone(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                                    placeholder="(00) 00000-0000"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <button 
                                            onClick={handleAddToCart}
                                            disabled={isSubmitting || !motherName || !motherPhone}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            ) : (
                                                <>FINALIZAR E ENVIAR WHATSAPP</>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
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

export default ProductCustomizationPage;