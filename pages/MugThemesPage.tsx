
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchIcon from '../components/icons/SearchIcon';
import { useThemes } from '../context/ThemeContext';

const MugThemesPage: React.FC = () => {
    const { themes } = useThemes();
    const [activeCategory, setActiveCategory] = useState<string>('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    const mugThemes = themes.filter(t => t.type === 'caneca');
    const categories = Array.from(new Set(mugThemes.map(t => t.category))).sort();

    const filteredThemes = useMemo(() => {
        return mugThemes.filter(theme => {
            const matchesCategory = activeCategory === 'TODOS' || theme.category === activeCategory;
            const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchTerm, mugThemes]);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            TEMAS DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CANECAS</span>
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-400">
                            Escolha a estampa perfeita para sua caneca personalizada. Temos opções para todas as ocasiões e gostos.
                        </p>
                    </div>
                    
                    <div className="bg-slate-800 rounded-xl p-4 mb-12 sticky top-20 z-40 border border-slate-700 shadow-lg">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 p-1 bg-slate-700/50 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                                <button
                                    onClick={() => setActiveCategory('TODOS')}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
                                        activeCategory === 'TODOS' ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    TODOS
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
                                            activeCategory === cat ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full lg:w-auto">
                                <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                <input 
                                    type="text"
                                    placeholder="Buscar tema..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredThemes.map(theme => (
                            <Link to={`/temas-canecas/${theme.id}`} key={theme.id} className="group block relative">
                                <div className="aspect-square overflow-hidden rounded-2xl shadow-lg border-2 border-slate-800 group-hover:border-cyan-500 transition-all duration-300 transform group-hover:scale-105">
                                    <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                    <div className="absolute bottom-0 left-0 p-5 w-full">
                                        <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                                            {theme.category}
                                        </span>
                                        <h3 className="text-white text-xl font-bold drop-shadow-md truncate">{theme.name}</h3>
                                        <div className="mt-3 w-full bg-white/10 backdrop-blur-md text-white border border-white/20 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-slate-900 text-center">
                                            ESCOLHER ESTE TEMA
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {filteredThemes.length === 0 && (
                        <div className="text-center py-24 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
                            <PhotographIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-xl text-slate-400">Nenhum tema encontrado com os filtros atuais.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Placeholder icon if PhotographIcon is not imported
const PhotographIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v12.75a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export default MugThemesPage;
