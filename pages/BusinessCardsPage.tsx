import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import UploadIcon from '../components/icons/UploadIcon';
import CreditCardIcon from '../components/icons/CreditCardIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import RefreshIcon from '../components/icons/RefreshIcon';
import { useServicePricing } from '../context/ServicePricingContext';
import { formatCurrency } from '../lib/formatters';

const BusinessCardsPage: React.FC = () => {
    const { pricing, loading: pricingLoading } = useServicePricing();
    const { cartoes_visita: cardsPricing } = pricing;
    
    const [selectedQuantity, setSelectedQuantity] = useState(200);
    const [selectedPaper, setSelectedPaper] = useState(cardsPricing.papers[0]);
    const [hasLamination, setHasLamination] = useState(false);
    const [isTwoSided, setIsTwoSided] = useState(false);

    useEffect(() => {
        if (!pricingLoading && cardsPricing.quantities.length > 0) {
            setSelectedQuantity(cardsPricing.quantities[0].quantity);
        }
        if (!pricingLoading && cardsPricing.papers.length > 0) {
            setSelectedPaper(cardsPricing.papers[0]);
        }
    }, [pricingLoading, cardsPricing]);

    const totalPrice = useMemo(() => {
        if (!selectedPaper || !cardsPricing?.quantities) return 0;
        let price = selectedPaper.basePrice || 0;

        const qtyConfig = cardsPricing.quantities.find((q: any) => q.quantity === selectedQuantity);
        if (qtyConfig) {
            price *= qtyConfig.multiplier;
        }

        if (hasLamination) {
            price *= cardsPricing.addons?.find((a: any) => a.id === 'lamination')?.priceMultiplier || 1;
        }

        if (isTwoSided) {
            price *= cardsPricing.addons?.find((a: any) => a.id === 'twoSided')?.priceMultiplier || 1;
        }

        return price;
    }, [selectedQuantity, selectedPaper, hasLamination, isTwoSided, cardsPricing]);
    
    if (pricingLoading) {
        return <div className="min-h-screen bg-slate-900 text-white text-center p-8">Carregando...</div>
    }

    if (!cardsPricing || !cardsPricing.papers || cardsPricing.papers.length === 0 || !selectedPaper) {
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
                    <Link to="/servicos" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
                        <ChevronLeftIcon className="w-4 h-4" />
                        Voltar para Serviços
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div className="lg:sticky top-24 h-max space-y-6">
                            <div className="bg-white/90 rounded-2xl p-6 border border-slate-700 flex items-center justify-center aspect-video relative">
                                <div className="text-center text-slate-400">
                                    <CreditCardIcon className="w-24 h-24 mx-auto" />
                                    <p className="mt-2 text-sm font-semibold">SUA ARTE 9X5.5CM</p>
                                </div>
                                <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">PREVIEW REAL</span>
                            </div>
                            <div className="bg-indigo-900/80 rounded-xl p-6 shadow-lg border border-indigo-700">
                                <p className="text-sm text-slate-300 uppercase">TOTAL DO PACOTE</p>
                                <p className="text-5xl font-bold text-white mt-1">{formatCurrency(totalPrice)}</p>
                                <p className="text-xs text-indigo-300 mt-2">{selectedQuantity} UNIDADES EM {selectedPaper.name}</p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight">CARTÕES DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">VISITA</span></h1>
                                <p className="text-slate-400 mt-1">Papel Premium e Acabamento Profissional.</p>
                            </div>

                            <OptionSection number={1} title="QUANTIDADE DE CARTÕES">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {cardsPricing?.quantities?.map((q: any) => (
                                        <button key={q.quantity} onClick={() => setSelectedQuantity(q.quantity)} className={`py-3 rounded-lg text-center font-bold transition-colors ${selectedQuantity === q.quantity ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/90 text-slate-800 hover:bg-white'}`}>
                                            {q.quantity}
                                        </button>
                                    ))}
                                </div>
                            </OptionSection>

                            <OptionSection number={2} title="GRAMAGEM / PAPEL">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cardsPricing?.papers?.map((p: any) => (
                                        <button key={p.id} onClick={() => setSelectedPaper(p)} className={`p-4 rounded-lg text-left border-2 transition-colors ${selectedPaper?.id === p.id ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                            <p className="font-bold">{p.name}</p>
                                            <p className="text-sm">{p.description}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <button onClick={() => setHasLamination(!hasLamination)} className={`p-4 rounded-lg flex items-center gap-3 border-2 transition-colors ${hasLamination ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                        <SparklesIcon className="w-5 h-5"/>
                                        <span className="font-semibold">{cardsPricing?.addons?.find((a: any) => a.id === 'lamination')?.name || 'Laminação'}</span>
                                    </button>
                                    <button onClick={() => setIsTwoSided(!isTwoSided)} className={`p-4 rounded-lg flex items-center gap-3 border-2 transition-colors ${isTwoSided ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                        <RefreshIcon className="w-5 h-5"/>
                                        <span className="font-semibold">{cardsPricing?.addons?.find((a: any) => a.id === 'twoSided')?.name || 'Frente/Verso'}</span>
                                    </button>
                                </div>
                            </OptionSection>

                            <OptionSection number={3} title="ENVIE SUA ARTE">
                                <button className="w-full bg-white/5 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors p-8 flex flex-col items-center justify-center">
                                    <UploadIcon className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="font-semibold text-slate-300">Clique para selecionar o arquivo</span>
                                </button>
                            </OptionSection>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors">
                                <ShoppingCartIcon className="w-5 h-5" />
                                ADICIONAR AO CARRINHO
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


export default BusinessCardsPage;