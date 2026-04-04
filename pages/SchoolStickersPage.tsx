import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import InfoIcon from '../components/icons/InfoIcon';
import DocumentIcon from '../components/icons/DocumentIcon';
import WaterDropIcon from '../components/icons/WaterDropIcon';
import { useThemes } from '../context/ThemeContext';
import { useServicePricing } from '../context/ServicePricingContext';
import { formatCurrency } from '../lib/formatters';

const materialIcons: { [key: string]: React.ElementType } = {
    papel: DocumentIcon,
    vinil: WaterDropIcon,
};

const SchoolStickersPage: React.FC = () => {
    const { themeId } = useParams<{ themeId: string }>();
    const { themes } = useThemes();
    const { pricing, loading: pricingLoading } = useServicePricing();
    const { adesivos_escolares: stickersPricing } = pricing;

    const selectedTheme = useMemo(() => {
        return themes.find(t => t.id.toString() === themeId);
    }, [themes, themeId]);

    const [studentName, setStudentName] = useState('');
    const [studentGrade, setStudentGrade] = useState('');
    const [studentSchool, setStudentSchool] = useState('');

    const [selectedPackage, setSelectedPackage] = useState(stickersPricing.packages[1]);
    const [selectedMaterial, setSelectedMaterial] = useState(stickersPricing.materials[1]);
    
    useEffect(() => {
        if (!pricingLoading && stickersPricing.packages && stickersPricing.packages.length > 0) {
            setSelectedPackage(stickersPricing.packages.length > 1 ? stickersPricing.packages[1] : stickersPricing.packages[0]);
        }
        if (!pricingLoading && stickersPricing.materials && stickersPricing.materials.length > 0) {
            setSelectedMaterial(stickersPricing.materials.length > 1 ? stickersPricing.materials[1] : stickersPricing.materials[0]);
        }
    }, [pricingLoading, stickersPricing]);

    const totalPrice = useMemo(() => {
        return selectedPackage?.price || 0;
    }, [selectedPackage]);
    
    if (pricingLoading) {
        return <div className="min-h-screen bg-slate-900 text-white text-center p-8">Carregando...</div>
    }

    if (!stickersPricing || !stickersPricing.packages || stickersPricing.packages.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Serviço Indisponível</h2>
                        <p className="text-slate-400 mb-6">Os preços para este serviço ainda não foram configurados pelo administrador.</p>
                        <Link to="/temas-escolares" className="text-indigo-400 hover:text-indigo-300">Voltar para Temas</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!selectedPackage || !selectedMaterial) {
        return <div className="min-h-screen bg-slate-900 text-white text-center p-8">Carregando...</div>
    }

    if (!selectedTheme) {
        return (
             <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-2xl font-bold">Tema não encontrado</h1>
                    <Link to="/temas-escolares" className="mt-4 inline-block bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">
                        Voltar para a seleção de temas
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }
    
    const MaterialIcon = materialIcons[selectedMaterial.id] || DocumentIcon;

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <Link to="/temas-escolares" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <ChevronLeftIcon className="w-4 h-4" />
                            TROCAR DE TEMA
                        </Link>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4">
                            VOLTA ÀS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">AULAS</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Kits de etiquetas personalizadas à prova d'água.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Preview */}
                        <div className="lg:sticky top-24 h-max space-y-6">
                            <div className="bg-slate-100/90 rounded-2xl p-6 relative overflow-hidden text-slate-800">
                                <p className="absolute text-8xl font-black text-slate-200/50 -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2 select-none">
                                    JC LAN HOUSE
                                </p>
                                <div className="relative space-y-4">
                                    <div className="bg-slate-200/80 rounded-lg p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-300 rounded-md flex-shrink-0">
                                            <img src={selectedTheme.imageUrl} alt={selectedTheme.name} className="w-full h-full object-cover rounded-md" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg break-all">{studentName || 'NOME DO ALUNO'}</p>
                                            <p className="text-sm text-slate-600">{studentGrade || 'SÉRIE / ANO'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="bg-slate-200/80 rounded-lg p-2 flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-300 rounded-sm flex-shrink-0"></div>
                                                <div>
                                                    <p className="text-xs font-semibold">{studentName.split(' ')[0] || 'Nome'}</p>
                                                    <p className="text-[10px] text-slate-500">{studentGrade || 'Série'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 flex justify-between items-center shadow-lg border border-slate-700">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">TOTAL DO KIT</p>
                                    <p className="text-4xl font-bold text-white">{formatCurrency(totalPrice)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400 uppercase">Material</p>
                                    <p className="text-lg font-semibold text-indigo-300">{selectedMaterial.name}</p>
                                </div>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                                <InfoIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-300">
                                    FITA TRANSPARENTE DE MATERIAL EM VINIL **PARA USO QUE IRÁ LAVAR (COPOS, LANCHEIRAS) PARA GARANTIR QUE O ADESIVO NÃO DESBOTE OU RASGUE.**
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Options */}
                        <div className="space-y-8">
                            <OptionSection number={1} title="IDENTIFICAÇÃO">
                                <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                                    <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nome Completo do Aluno" className="w-full bg-slate-700/80 p-3 rounded-md text-sm border border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"/>
                                    <div className="flex gap-3">
                                        <input type="text" value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} placeholder="Série / Ano" className="w-full bg-slate-700/80 p-3 rounded-md text-sm border border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"/>
                                        <input type="text" value={studentSchool} onChange={(e) => setStudentSchool(e.target.value)} placeholder="Escola" className="w-full bg-slate-700/80 p-3 rounded-md text-sm border border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"/>
                                    </div>
                                </div>
                            </OptionSection>

                            <OptionSection number={2} title="TEMA ESCOLHIDO">
                               <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                                   <img src={selectedTheme.imageUrl} alt={selectedTheme.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                   <div>
                                      <p className="font-bold text-white text-lg">{selectedTheme.name}</p>
                                      <p className="text-xs text-slate-400">Para alterar, volte à página anterior.</p>
                                   </div>
                               </div>
                            </OptionSection>

                            <OptionSection number={3} title="SELECIONE O PACOTE">
                                 <div className="space-y-3">
                                    {stickersPricing.packages.map((pkg: any) => (
                                        <button key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={`w-full flex justify-between items-center p-4 rounded-lg border-2 text-left transition-all duration-200 ${selectedPackage.id === pkg.id ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                                            <div>
                                                <p className={`font-semibold ${selectedPackage.id === pkg.id ? 'text-white' : 'text-slate-300'}`}>{pkg.name}</p>
                                                <p className="text-xs text-slate-400">{pkg.description}</p>
                                            </div>
                                            <p className="font-bold text-lg">{formatCurrency(pkg.price)}</p>
                                        </button>
                                    ))}
                                </div>
                            </OptionSection>

                            <OptionSection number={4} title="TIPO DE MATERIAL">
                                <div className="grid grid-cols-2 gap-4">
                                    {stickersPricing.materials.map((mat: any) => {
                                        const Icon = materialIcons[mat.id] || DocumentIcon;
                                        return (
                                            <button key={mat.id} onClick={() => setSelectedMaterial(mat)} className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${selectedMaterial.id === mat.id ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                                                <Icon className="w-6 h-6 mx-auto mb-2" />
                                                <p className="font-semibold text-sm">{mat.name}</p>
                                            </button>
                                        )
                                    })}
                                </div>
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

export default SchoolStickersPage;