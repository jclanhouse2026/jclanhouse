
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePortfolio } from '../context/PortfolioContext';
import { useCategories } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';

const PortfolioPage: React.FC = () => {
  const { products } = usePortfolio();
  const { categories } = useCategories();
  const [activeFilter, setActiveFilter] = useState<{ type: 'all' | 'category' | 'subcategory', id: string | null }>({ type: 'all', id: null });

  const filteredProducts = useMemo(() => {
    if (activeFilter.type === 'all') {
      return products;
    }
    if (activeFilter.type === 'category') {
      return products.filter(p => p.categoryId === activeFilter.id);
    }
    if (activeFilter.type === 'subcategory') {
      return products.filter(p => p.subcategoryId === activeFilter.id);
    }
    return products;
  }, [products, activeFilter]);

  const getFilterClass = (type: 'all' | 'category' | 'subcategory', id: string | null) => {
    return activeFilter.type === type && activeFilter.id === id 
        ? 'bg-cyan-500/20 text-cyan-300 font-semibold' 
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50';
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold text-cyan-400 tracking-wider uppercase">Conheça</h2>
            <p className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Nossos Produtos
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar de Filtros */}
              <aside className="w-full lg:w-64 flex-shrink-0">
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 lg:sticky lg:top-24">
                      <h3 className="font-bold text-white mb-4 hidden lg:block">Categorias</h3>
                      <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar">
                          <li className="flex-shrink-0 lg:flex-shrink">
                              <button onClick={() => setActiveFilter({type: 'all', id: null})} className={`whitespace-nowrap w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${getFilterClass('all', null)}`}>
                                  Mostrar Todos
                              </button>
                          </li>
                          <li className="flex-shrink-0 lg:flex-shrink">
                              <Link to="/temas-canecas" className="whitespace-nowrap w-full text-left px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 block">
                                  Temas de Caneca
                              </Link>
                          </li>
                          {categories.map(category => (
                              <li key={category.id} className="flex-shrink-0 lg:flex-shrink">
                                  <button onClick={() => setActiveFilter({type: 'category', id: category.id})} className={`whitespace-nowrap w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors ${getFilterClass('category', category.id)}`}>
                                      {category.name}
                                  </button>
                                  {category.subcategories.length > 0 && (
                                      <ul className="hidden lg:block pl-4 mt-1 space-y-1 border-l border-slate-700 ml-2">
                                          {category.subcategories.map(sub => (
                                              <li key={sub.id}>
                                                  <button onClick={() => setActiveFilter({type: 'subcategory', id: sub.id})} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${getFilterClass('subcategory', sub.id)}`}>
                                                      {sub.name}
                                                  </button>
                                              </li>
                                          ))}
                                      </ul>
                                  )}
                              </li>
                          ))}
                      </ul>
                  </div>
              </aside>

              {/* Grid de Produtos */}
              <div className="flex-1">
                  {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                      ))}
                  </div>
                  ) : (
                  <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg h-full flex flex-col justify-center">
                      <p className="font-semibold">Nenhum produto encontrado.</p>
                      <p className="text-sm mt-2">Tente selecionar outra categoria ou volte mais tarde.</p>
                  </div>
                  )}
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioPage;
