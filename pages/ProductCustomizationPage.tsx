import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SparklesIcon from '../components/icons/SparklesIcon';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import { useThemes } from '../context/ThemeContext';
import { useServicePricing } from '../context/ServicePricingContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/formatters';

const ProductCustomizationPage: React.FC = () => {
    const { themeId } = useParams<{ themeId: string }>();
    const { themes } = useThemes();
    const { pricing, loading: pricingLoading } = useServicePricing();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const { caderneta: cadernetaPricing } = pricing;

    const theme = useMemo(() => {
        return themes.find(t => t.id.toString() === themeId);
    }, [themes, themeId]);
    
    const [childName, setChildName] = useState('');
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

    const handleAddToCart = () => {
        if (!theme || !selectedMainOption) return;

        const addonsText = selectedAddons.length > 0 
            ? ` + Adicionais: ${selectedAddons.map(a => a.name).join(', ')}` 
            : '';

        addToCart({
            productId: `caderneta-${theme.id}`,
            name: `Caderneta de Vacina (${selectedMainOption.name}) - Tema: ${theme.name}`,
            image: theme.imageUrl,
            quantity: 1,
            unitPrice: totalPrice,
            customization: {
                text: `Nome da Criança: ${childName || 'Não informado'}${addonsText}`
            }
        });

        navigate('/carrinho');
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Preview & Price */}
                        <div className="space-y-8 lg:sticky top-28 h-max">
                            <div className="relative aspect-[4/5] w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700">
                               <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-8">
                                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg text-center text-slate-800 shadow-xl w-full">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">PREVIEW DA CAPA</p>
                                        <h2 className="text-2xl sm:text-3xl font-bold my-2 break-words">{childName || 'NOME DA CRIANÇA'}</h2>
                                        <p className="text-xs font-bold text-slate-500">TEMA: {theme.name.toUpperCase()}</p>
                                    </div>
                               </div>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-6 flex justify-between items-center shadow-lg border border-slate-700 max-w-lg mx-auto w-full">
                                <div>
                                    <p className="text-sm text-slate-400">TOTAL DO ITEM</p>
                                    <p className="text-4xl font-bold text-white">{formatCurrency(totalPrice)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400">UNITÁRIO</p>
                                    <p className="text-lg font-semibold text-slate-300">{formatCurrency(selectedMainOption?.price || 0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Options */}
                        <div className="space-y-8">
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

                            <div>
                                <button 
                                    onClick={handleAddToCart}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors"
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    CONFIRMAR E CARRINHO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductCustomizationPage;