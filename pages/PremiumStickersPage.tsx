import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GiftIcon from '../components/icons/GiftIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ImageIcon from '../components/icons/ImageIcon';
import UploadIcon from '../components/icons/UploadIcon';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import { useServicePricing } from '../context/ServicePricingContext';
import { formatCurrency } from '../lib/formatters';

const PremiumStickersPage: React.FC = () => {
    const { pricing, loading: pricingLoading } = useServicePricing();
    const { adesivos_premium: premiumPricing } = pricing;

    const [selectedSize, setSelectedSize] = useState<number>(5);
    const [selectedFormat, setSelectedFormat] = useState<'redondo' | 'quadrado'>('redondo');
    const [selectedMaterial, setSelectedMaterial] = useState(premiumPricing.materials[0]);
    const [hasLamination, setHasLamination] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(50);

    useEffect(() => {
        if (!pricingLoading && premiumPricing.materials.length > 0) {
            setSelectedMaterial(premiumPricing.materials[0]);
        }
        if (!pricingLoading && premiumPricing.sizes.length > 0) {
            setSelectedSize(premiumPricing.sizes[0].size);
        }
    }, [pricingLoading, premiumPricing.materials, premiumPricing.sizes]);

    const { totalPrice, pricePerUnit } = useMemo(() => {
        if (!selectedMaterial) return { totalPrice: 0, pricePerUnit: 0 };
        
        const sizeConfig = premiumPricing.sizes.find((s: any) => s.size === selectedSize);
        const basePrice = sizeConfig ? sizeConfig.price : 0.50;

        let unitPrice = basePrice * (selectedMaterial.priceModifier || 1);
        if (hasLamination) {
            unitPrice += premiumPricing?.lamination?.pricePerUnit || 0;
        }

        let discount = 1;
        if (quantity >= 100) discount = 0.9;
        if (quantity >= 250) discount = 0.8;
        if (quantity >= 500) discount = 0.7;
        
        const finalUnitPrice = unitPrice * discount;
        const total = finalUnitPrice * quantity;

        const finalTotal = Math.max(total, 5.00);

        return { totalPrice: finalTotal, pricePerUnit: finalUnitPrice };

    }, [selectedSize, selectedMaterial, hasLamination, quantity, premiumPricing]);
    
    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(10, prev + amount));
    };
    
    if (pricingLoading) {
        return <div className="min-h-screen bg-slate-900 text-white text-center p-8">Carregando...</div>
    }

    if (!premiumPricing || !premiumPricing.materials || premiumPricing.materials.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Serviço Indisponível</h2>
                        <p className="text-slate-400 mb-6">Os preços para este serviço ainda não foram configurados pelo administrador.</p>
                        <Link to="/servicos" className="text-indigo-400 hover:text-indigo-300">Voltar para Serviços</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-indigo-900/80 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border border-indigo-700 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-pink-500/20 p-3 rounded-lg">
                                <GiftIcon className="w-6 h-6 text-pink-400" />
                            </div>
                            <div>
                                <h2 className="font-bold"><span className="text-pink-400">PROMOÇÃO</span> EXCLUSIVA</h2>
                                <p className="text-sm text-slate-300">100 ADESIVOS DE 4CM (PAPEL COMUM) POR APENAS <span className="font-bold text-white">R$ 20.00</span></p>
                            </div>
                        </div>
                        <button className="bg-white/90 text-indigo-900 font-bold text-sm py-2 px-6 rounded-lg hover:bg-white transition-colors flex-shrink-0">
                            ATIVAR AGORA
                        </button>
                    </div>
                    
                    <Link to="/servicos" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
                        <ChevronLeftIcon className="w-4 h-4" />
                        Voltar para Serviços
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div className="lg:sticky top-24 h-max space-y-6">
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 flex items-center justify-center aspect-square">
                                <div className="text-center text-slate-500">
                                    <ImageIcon className="w-16 h-16 mx-auto" />
                                    <p className="mt-2 text-sm font-semibold">SUA ARTE AQUI</p>
                                </div>
                            </div>
                            <div className="bg-indigo-900/80 rounded-xl p-6 flex justify-between items-center shadow-lg border border-indigo-700">
                                <div>
                                    <p className="text-sm text-slate-300 uppercase">TOTAL ESTIMADO</p>
                                    <p className="text-4xl font-bold text-white">{formatCurrency(totalPrice)}</p>
                                    <p className="text-xs text-indigo-300">DE {formatCurrency(pricePerUnit)} POR UNIDADE</p>
                                </div>
                                <div className="bg-indigo-500 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold">
                                    {quantity}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">ADESIVOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">PREMIUM</span></h1>
                                <p className="text-slate-400 mt-1">Configure seu adesivo personalizado.</p>
                            </div>

                            <OptionSection number={1} title="TAMANHO">
                                <div className="grid grid-cols-5 gap-3">
                                    {premiumPricing?.sizes?.map((s: any) => (
                                        <button key={s.id} onClick={() => setSelectedSize(s.size)} className={`py-3 rounded-lg text-center font-bold transition-colors ${selectedSize === s.size ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/90 text-slate-800 hover:bg-white'}`}>
                                            {s.size} <span className="font-normal text-xs">cm</span>
                                        </button>
                                    ))}
                                </div>
                            </OptionSection>

                            <OptionSection number={2} title="FORMATO">
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setSelectedFormat('redondo')} className={`py-4 rounded-lg flex items-center justify-center gap-2 border-2 transition-colors ${selectedFormat === 'redondo' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                        <div className="w-5 h-5 border-2 border-current rounded-full"></div> <span className="font-semibold">REDONDO</span>
                                    </button>
                                    <button onClick={() => setSelectedFormat('quadrado')} className={`py-4 rounded-lg flex items-center justify-center gap-2 border-2 transition-colors ${selectedFormat === 'quadrado' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                        <div className="w-5 h-5 border-2 border-current"></div> <span className="font-semibold">QUADRADO</span>
                                    </button>
                                </div>
                            </OptionSection>

                            <OptionSection number={3} title="MATERIAL E ACABAMENTO">
                                <div className="space-y-3">
                                    {premiumPricing?.materials?.map((mat: any) => (
                                        <button key={mat.id} onClick={() => setSelectedMaterial(mat)} className={`w-full p-4 rounded-lg border-2 text-left flex justify-between items-center transition-colors ${selectedMaterial?.id === mat.id ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                                            <span className="font-semibold">{mat.name}</span>
                                            <span className="text-xs font-medium text-slate-400">{mat.priceText}</span>
                                        </button>
                                    ))}
                                    <button onClick={() => setHasLamination(!hasLamination)} className={`w-full p-4 rounded-lg border-2 text-left flex justify-between items-center transition-colors ${hasLamination ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                                        <span className="font-semibold">{premiumPricing?.lamination?.name || 'Laminação'}</span>
                                        <span className="text-xs font-medium text-slate-400">{premiumPricing?.lamination?.priceText || ''}</span>
                                    </button>
                                </div>
                            </OptionSection>
                            
                            <OptionSection number={4} title="ARTE E TIRAGEM">
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="bg-white/90 text-slate-800 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-white">
                                        <UploadIcon className="w-6 h-6 mb-1" />
                                        <span className="font-semibold text-sm">UPLOAD ARTE</span>
                                    </button>
                                    <div className="bg-white/90 text-slate-800 rounded-lg p-2 flex items-center justify-between">
                                        <button onClick={() => handleQuantityChange(-10)} className="w-10 h-10 text-2xl font-bold text-indigo-500">-</button>
                                        <span className="text-2xl font-bold">{quantity}</span>
                                        <button onClick={() => handleQuantityChange(10)} className="w-10 h-10 text-2xl font-bold text-indigo-500">+</button>
                                    </div>
                                </div>
                            </OptionSection>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors">
                                <ShoppingCartIcon className="w-5 h-5" />
                                CONFIRMAR PEDIDO
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const OptionSection: React.FC<{number: number, title: string, children: React.ReactNode}> = ({number, title, children}) => (
    <div className="space-y-3">
        <h3 className="text-sm font-bold text-indigo-300 tracking-wider flex items-center gap-3">
            <span className="flex items-center justify-center w-5 h-5 text-xs bg-indigo-500/20 text-indigo-300 rounded-full font-bold">{number}</span>
            {title}
        </h3>
        {children}
    </div>
);


export default PremiumStickersPage;