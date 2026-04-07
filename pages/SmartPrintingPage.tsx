import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import CheckBadgeIcon from '../components/icons/CheckBadgeIcon';
import BoltIcon from '../components/icons/BoltIcon';
import WaterDropIcon from '../components/icons/WaterDropIcon';
import LightBulbIcon from '../components/icons/LightBulbIcon';
import { useServicePricing } from '../context/ServicePricingContext';
import { formatCurrency } from '../lib/formatters';

type Tech = 'laser' | 'inkjet';
type ColorMode = 'bw' | 'color';

const SmartPrintingPage: React.FC = () => {
    const { pricing, loading: pricingLoading } = useServicePricing();
    const { impressao: printPricing } = pricing;
    
    const [selectedTech, setSelectedTech] = useState<Tech>('laser');
    const [selectedPaperFormat, setSelectedPaperFormat] = useState(printPricing.formatModifiers[0]?.id || 'a4');
    const [selectedColorMode, setSelectedColorMode] = useState<ColorMode>('bw');
    const [selectedMedia, setSelectedMedia] = useState(printPricing.mediaModifiers[0]?.id || 'comum');
    const [pageVolume, setPageVolume] = useState<number>(1);
    
    useEffect(() => {
        if (!pricingLoading) {
            if (selectedTech === 'laser') {
                setSelectedPaperFormat('a4');
                setSelectedMedia('comum');
            } else {
                setSelectedPaperFormat(printPricing.formatModifiers[0]?.id || 'a4');
                setSelectedMedia(printPricing.mediaModifiers[0]?.id || 'comum');
            }
        }
    }, [selectedTech, pricingLoading, printPricing]);

    const { unitPrice, totalPrice } = useMemo(() => {
        if (pricingLoading) return { unitPrice: 0, totalPrice: 0 };
        
        const format = printPricing.formatModifiers.find((f: any) => f.id === selectedPaperFormat);
        const media = printPricing.mediaModifiers.find((m: any) => m.id === selectedMedia);

        if (!format || !media) return { unitPrice: 0, totalPrice: 0 };

        let price = printPricing.basePrice * format.multiplier + media.price;
        
        if (selectedColorMode === 'bw') {
            price *= printPricing.techModifiers[selectedTech].base;
        } else {
            price *= printPricing.techModifiers[selectedTech].color;
        }

        const finalUnitPrice = Math.max(price, 0.25);
        const finalTotalPrice = finalUnitPrice * pageVolume;

        return { unitPrice: finalUnitPrice, totalPrice: finalTotalPrice };

    }, [selectedTech, selectedPaperFormat, selectedColorMode, selectedMedia, pageVolume, printPricing, pricingLoading]);
    
    const getMediaName = (mediaId: string) => {
        return (printPricing.mediaModifiers.find((m: any) => m.id === mediaId)?.name || 'N/A').toUpperCase();
    }
    
    if (pricingLoading) {
        return <div className="min-h-screen bg-slate-900 text-white text-center p-8">Carregando...</div>
    }

    if (!printPricing || !printPricing.formatModifiers || printPricing.formatModifiers.length === 0) {
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

    const setupDetails = {
        tech: selectedTech === 'laser' ? 'LASER PRO' : 'JATO DE TINTA',
        ink: selectedTech === 'laser' ? 'TONER SECO' : 'TINTA LÍQUIDA',
        paper: selectedPaperFormat,
        media: getMediaName(selectedMedia),
        color: selectedColorMode === 'bw' ? 'PRETO & BRANCO' : 'COLORIDO',
    };

    const handleVolumeChange = (amount: number) => {
        setPageVolume(prev => Math.max(1, prev + amount));
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    <Link to="/servicos" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
                        <ChevronLeftIcon className="w-4 h-4" />
                        VOLTAR PARA SERVIÇOS
                    </Link>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div className="lg:sticky top-24 h-max space-y-6">
                            <div className="bg-white/95 rounded-2xl p-8 border border-slate-200 text-slate-800 shadow-lg">
                                <h2 className="text-xl font-black tracking-tighter">SETUP DE <span className="text-indigo-600">CUSTO</span></h2>
                                <p className="text-xs text-slate-500 mb-6">CÁLCULO DINÂMICO BASEADO NA TECNOLOGIA SELECIONADA</p>
                                <div className="space-y-3">
                                    <InfoRow label="MARCA / TECNOLOGIA" value={setupDetails.tech} />
                                    <InfoRow label="TIPO DE TINTA" value={setupDetails.ink} />
                                    <InfoRow label="FORMATO PAPEL" value={setupDetails.paper} />
                                    <InfoRow label="TIPO DE MÍDIA" value={setupDetails.media} />
                                    <InfoRow label="MODO DE COR" value={setupDetails.color} />
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-slate-500">CUSTO UNITÁRIO</p>
                                        <p className="text-2xl font-bold">{formatCurrency(unitPrice)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-indigo-600 font-semibold">INVESTIMENTO TOTAL</p>
                                        <p className="text-3xl font-bold text-indigo-600">{formatCurrency(totalPrice)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-lg p-4 flex items-start gap-4">
                                <LightBulbIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm text-indigo-300">DICA JC LAN HOUSE</h4>
                                    <p className="text-xs text-indigo-400/80 mt-1">
                                        A TINTA PIGMENTADA tem maior durabilidade para fins profissionais (documentos, relatórios, etc.) enquanto CORANTE tem cores mais vivas (fotos, convites, etc.).
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight">IMPRESSÃO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">SMART</span></h1>
                                <p className="text-slate-400 mt-1">Configure seu pedido de impressão profissional.</p>
                            </div>
                            
                            <OptionSection number={1} title="ESCOLHA A MARCA / TECNOLOGIA">
                               <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setSelectedTech('laser')} className={`py-4 rounded-lg flex items-center justify-center gap-2 border-2 transition-colors ${selectedTech === 'laser' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                        <BoltIcon className="w-5 h-5"/> <span className="font-semibold">LASER PRO</span>
                                    </button>
                                    <button onClick={() => setSelectedTech('inkjet')} className={`py-4 rounded-lg flex items-center justify-center gap-2 border-2 transition-colors ${selectedTech === 'inkjet' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/90 text-slate-800 border-transparent hover:bg-white'}`}>
                                        <WaterDropIcon className="w-5 h-5"/> <span className="font-semibold">JATO DE TINTA</span>
                                    </button>
                                </div>
                            </OptionSection>

                            <OptionSection number={2} title="FORMATO DO PAPEL">
                                {selectedTech === 'laser' ? (
                                    <button disabled className="py-3 rounded-lg text-center font-bold bg-slate-800 text-white shadow-lg border-2 border-slate-600 w-full cursor-not-allowed">A4</button>
                                ) : (
                                    <div className="grid grid-cols-5 gap-3">
                                        {printPricing.formatModifiers.map((format: any) => (
                                            <button key={format.id} onClick={() => setSelectedPaperFormat(format.id)} className={`py-3 rounded-lg text-center font-bold transition-colors ${selectedPaperFormat === format.id ? 'bg-slate-800 text-white shadow-lg border-2 border-slate-600' : 'bg-white/90 text-slate-800 hover:bg-white'}`}>
                                                {format.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </OptionSection>

                            <OptionSection number={3} title="MODO DE COR">
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setSelectedColorMode('bw')} className={`py-4 rounded-lg font-semibold transition-colors ${selectedColorMode === 'bw' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/90 text-slate-800 hover:bg-white'}`}>P&B</button>
                                    <button onClick={() => setSelectedColorMode('color')} className={`py-4 rounded-lg font-semibold transition-colors ${selectedColorMode === 'color' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/90 text-slate-800 hover:bg-white'}`}>COLORIDO</button>
                                </div>
                            </OptionSection>

                            <OptionSection number={4} title="ESCOLHA A MÍDIA / GRAMATURA">
                                {selectedTech === 'laser' ? (
                                    <button disabled className="w-full p-4 rounded-lg border-2 text-left flex justify-between items-center bg-indigo-600 border-indigo-500 cursor-not-allowed">
                                        <span className="font-semibold">PAPEL COMUM 75G</span>
                                        <span className="text-xs font-medium text-slate-300">PADRÃO</span>
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {printPricing.mediaModifiers.map((media: any) => (
                                            <button key={media.id} onClick={() => setSelectedMedia(media.id)} className={`p-3 rounded-lg border-2 text-center transition-colors ${selectedMedia === media.id ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                                                <span className="font-semibold text-sm">{media.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </OptionSection>

                            <OptionSection number={5} title="VOLUME DE PÁGINAS">
                                <div className="bg-white/90 text-slate-800 rounded-lg p-2 flex items-center justify-between">
                                    <button onClick={() => handleVolumeChange(-1)} className="w-12 h-12 text-2xl font-bold text-indigo-500">-</button>
                                    <span className="text-3xl font-bold">{pageVolume}</span>
                                    <button onClick={() => handleVolumeChange(1)} className="w-12 h-12 text-2xl font-bold text-indigo-500">+</button>
                                </div>
                            </OptionSection>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors">
                                <CheckBadgeIcon className="w-5 h-5" />
                                FINALIZAR E ADICIONAR
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

const InfoRow: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div className="bg-slate-100 rounded-md p-3 flex justify-between items-center text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold text-slate-700">{value}</span>
    </div>
);

export default SmartPrintingPage;