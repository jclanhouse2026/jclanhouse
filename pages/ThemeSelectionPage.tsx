
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchIcon from '../components/icons/SearchIcon';
import { useThemes } from '../context/ThemeContext';
import type { ThemeCategory } from '../types';

const ThemeSelectionPage: React.FC = () => {
    const { themes } = useThemes();
    const [activeCategory, setActiveCategory] = useState<ThemeCategory | 'TODOS'>('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredThemes = useMemo(() => {
        return themes.filter(theme => {
            const isCaderneta = theme.type === 'caderneta' || !theme.type;
            const matchesCategory = activeCategory === 'TODOS' || theme.category === activeCategory;
            const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase());
            return isCaderneta && matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchTerm, themes]);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            CADERNETA DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">VACINA</span>
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-400">
                            Nossas cadernetas possuem capa dura, laminação protetora e miolo oficial atualizado. Escolha um tema abaixo para personalizar.
                        </p>
                    </div>
                    
                    <div className="bg-slate-800 rounded-xl p-4 mb-12 sticky top-20 z-40 border border-slate-700 shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 p-1 bg-slate-700/50 rounded-lg">
                                {(['TODOS', 'MENINO', 'MENINA', 'UNISSEX'] as (ThemeCategory | 'TODOS')[]).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                            activeCategory === cat ? 'bg-orange-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-auto">
                                <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                <input 
                                    type="text"
                                    placeholder="Buscar tema..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredThemes.map(theme => (
                            <Link to={`/caderneta/${theme.id}`} key={theme.id} className="group block">
                                <div className="aspect-w-3 aspect-h-4 overflow-hidden rounded-2xl shadow-lg border-2 border-slate-800 group-hover:border-orange-500 transition-all duration-300 transform group-hover:scale-105">
                                    <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <h3 className="text-white text-lg font-bold drop-shadow-md">{theme.name}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {filteredThemes.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <p>Nenhum tema encontrado com os filtros atuais.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ThemeSelectionPage;
