import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePortfolio } from '../context/PortfolioContext';
import { useHomeSettings } from '../context/HomeSettingsContext';
import { useMyWorks } from '../context/MyWorksContext';
import ProductCard from '../components/ProductCard';
import { IconMap } from '../components/IconMap';


const HomePage: React.FC = () => {
    const { products } = usePortfolio();
    const { settings } = useHomeSettings();
    const { works, error } = useMyWorks();
    const { hero, categories, differentials } = settings;

    const featuredProducts = products.filter(p => p.images.length > 0).slice(0, 4);

    const getVideoEmbedUrl = (url: string): string | null => {
        if (!url) return null;
        let videoId = '';
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
                videoId = urlObj.searchParams.get('v') || '';
            }
        } catch (e) {
            // Fallback for non-URL strings or invalid URLs
            return null;
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return null;
    };


  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main>
        {/* Hero Section */}
        <div className="relative pt-24 pb-32 flex content-center items-center justify-center min-h-[60vh] sm:min-h-[75vh]">
          <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{ backgroundImage: `url('${hero.imageUrl}')` }}>
            <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
          </div>
          <div className="container relative mx-auto">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-8/12 px-4 ml-auto mr-auto text-center">
                <div>
                  <h1 className="text-white font-semibold text-4xl md:text-5xl">
                    {hero.title}
                  </h1>
                  <p className="mt-4 text-base md:text-lg text-slate-300">
                    {hero.subtitle}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                     <Link to="/portfolio" className="w-full sm:w-auto bg-cyan-500 text-white font-bold py-3 px-8 rounded-full hover:bg-cyan-600 transition-colors shadow-lg text-lg">
                        Ver Produtos
                      </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegue por Categorias */}
        <section className="pb-20 bg-slate-800 -mt-24">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white">Navegue por Categorias</h2>
                <p className="text-slate-400 mt-2">Encontre exatamente o que você precisa.</p>
            </div>
            <div className="flex flex-wrap justify-center">
                {categories.map((category) => {
                    const Icon = IconMap[category.icon] || IconMap['GiftIcon'];
                    return(
                        <div key={category.id} className="w-full md:w-4/12 lg:w-3/12 px-4 text-center">
                            <Link to={category.link}>
                                <div className="relative flex flex-col min-w-0 break-words bg-slate-900 w-full mb-8 shadow-2xl rounded-lg transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="px-4 py-5 flex-auto">
                                        <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-cyan-500/20 text-cyan-400">
                                            <Icon />
                                        </div>
                                        <h6 className="text-xl font-semibold">{category.name}</h6>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
          </div>
        </section>

        {/* Produtos em Destaque */}
        <section className="py-20 bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white">Produtos em Destaque</h2>
                    <p className="text-slate-400 mt-2">Os favoritos dos nossos clientes.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Link to="/portfolio" className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-full hover:bg-cyan-600 transition-colors shadow-lg">
                        Ver Todos os Produtos
                    </Link>
                </div>
            </div>
        </section>

        {/* Nossos Trabalhos (Vídeos) */}
        {error ? (
             <section className="py-20 bg-slate-800">
                <div className="container mx-auto px-4">
                    <div className="text-center p-8 bg-red-900/30 rounded-lg border border-red-800">
                        <h2 className="text-2xl font-bold text-red-300">Erro ao Carregar Trabalhos</h2>
                        <p className="text-slate-400 mt-2">Não foi possível exibir a seção "Nossos Trabalhos" no momento.</p>
                    </div>
                </div>
            </section>
        ) : (
            works.length > 0 && (
                <section className="py-20 bg-slate-800">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-white">Nossos Trabalhos</h2>
                            <p className="text-slate-400 mt-2">Veja alguns de nossos projetos em vídeo.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {works.map(work => {
                                const embedUrl = getVideoEmbedUrl(work.video_url);
                                if (!embedUrl) return null;
                                return (
                                    <div key={work.id} className="bg-slate-900 rounded-lg overflow-hidden shadow-lg border border-slate-700">
                                        <div className="relative" style={{ paddingTop: '56.25%' }}> {/* Proporção 16:9 */}
                                            <iframe 
                                                src={embedUrl}
                                                title={work.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute top-0 left-0 w-full h-full"
                                            ></iframe>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-white">{work.title}</h3>
                                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{work.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )
        )}

        {/* Nossos Diferenciais */}
        <section className="py-20 bg-slate-900">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white">Nossos Diferenciais</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {differentials.map(item => {
                        const Icon = IconMap[item.icon] || IconMap['SparklesIcon'];
                        return (
                            <div key={item.id} className="flex flex-col items-center">
                                <div className="p-4 bg-slate-700/50 rounded-full mb-4">
                                    <Icon className="w-8 h-8 text-cyan-400"/>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-slate-400">{item.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;