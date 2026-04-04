import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import UploadIcon from '../components/icons/UploadIcon';
import DocumentIcon from '../components/icons/DocumentIcon';
import CheckBadgeIcon from '../components/icons/CheckBadgeIcon';
import { useServicePricing } from '../context/ServicePricingContext';
import { formatCurrency } from '../lib/formatters';

const FlyersPage: React.FC = () => {
    const { pricing, loading: pricingLoading } = useServicePricing();
    const { panfletos: flyersPricing } = pricing;

    const [selectedFormat, setSelectedFormat] = useState(flyersPricing.formats[0]);
    const [selectedQuantity, setSelectedQuantity] = useState(flyersPricing.quantities[0]);

    useEffect(() => {
        if (!pricingLoading && flyersPricing.formats.length > 0) {
            setSelectedFormat(flyersPricing.formats[0]);
        }
        if (!pricingLoading && flyersPricing.quantities.length > 0) {
            setSelectedQuantity(flyersPricing.quantities[0]);
        }
    }, [pricingLoading, flyersPricing]);

    const totalPrice = useMemo(() => {
        if (!selectedFormat || !selectedQuantity || !flyersPricing.prices) return 0;
        return flyersPricing.prices[selectedFormat.id]?.[selectedQuantity] || 0;
    }, [selectedFormat, selectedQuantity, flyersPricing.prices]);

    if (pricingLoading) {
        return <div className="min-h-screen bg-slate-900 text-white text-center p-8">Carregando...</div>
    }

    if (!flyersPricing || !flyersPricing.formats || flyersPricing.formats.length === 0) {
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
                            <div className="bg-white/90 rounded-2xl p-6 border border-slate-700 flex items-center justify-center aspect-square">
                                <div className="text-center text-slate-400">
                                    <DocumentIcon className="w-24 h-24 mx-auto" />
                                    <p className="mt-2 text-sm font-semibold">SUA ARTE AQUI ({selectedFormat?.name || ''})</p>
                                </div>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-6 flex justify-between items-center shadow-lg border border-slate-700">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">TOTAL DO LOTE</p>
                                    <p className="text-5xl font-bold text-white">{formatCurrency(totalPrice)}</p>
                                </div>
                                <div className="text-center border-2 border-slate-600 rounded-lg px-4 py-2">
                                    <p className="text-xs text-slate-400 uppercase">Tiragem Selecionada</p>
                                    <p className="text-lg font-bold text-indigo-300">{selectedQuantity} UNIDADES</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight">PANFLETOS</h1>
                                <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">PROMOCIONAIS</h1>
                                <p className="text-slate-400 mt-2">Imprima sua propaganda com qualidade máxima e cores vivas.</p>
                            </div>

                            <OptionSection number={1} title="ESCOLHA O FORMATO (CM)">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {flyersPricing?.formats?.map((f: any) => (
                                        <button key={f.id} onClick={() => setSelectedFormat(f)} className={`p-4 rounded-lg text-center border-2 transition-colors ${selectedFormat?.id === f.id ? 'bg-indigo-600 border-indigo-500' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                            <p className="font-bold">{f.name}</p>
                                            <p className="text-sm">{f.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </OptionSection>

                            <OptionSection number={2} title="QUANTIDADE DE IMPRESSÃO">
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {flyersPricing?.quantities?.map((q: number) => (
                                        <button key={q} onClick={() => setSelectedQuantity(q)} className={`py-3 rounded-lg text-center font-bold transition-colors ${selectedQuantity === q ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/90 text-slate-800 hover:bg-white'}`}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </OptionSection>
                            
                            <OptionSection number={3} title="ENVIE SUA ARTE OU MODELO">
                                <button className="w-full bg-white/5 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors p-8 flex flex-col items-center justify-center text-center">
                                    <UploadIcon className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="font-semibold text-slate-300">Selecione o arquivo da sua arte</span>
                                    <span className="text-xs text-slate-500 mt-1">ACEITAMOS .PDF, .JPG OU .PNG DE ALTA RESOLUÇÃO</span>
                                </button>
                            </OptionSection>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors">
                                <CheckBadgeIcon className="w-5 h-5" />
                                FINALIZAR PEDIDO
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

export default FlyersPage;