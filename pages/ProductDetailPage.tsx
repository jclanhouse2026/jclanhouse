
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePortfolio } from '../context/PortfolioContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import UploadIcon from '../components/icons/UploadIcon';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../lib/formatters';

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { products } = usePortfolio();
    const { categories } = useCategories();
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [customText, setCustomText] = useState('');
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [addedToCart, setAddedToCart] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const product = useMemo(() => {
        return products.find(p => p.id.toString() === productId);
    }, [products, productId]);

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return products
            .filter(p => p.id !== product.id && p.images.length > 0)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
    }, [products, product]);

    const getCategoryName = () => {
        if (!product) return '';
        const category = categories.find(c => c.id === product.categoryId);
        if (!category) return 'Geral';
        const subcategory = category.subcategories.find(s => s.id === product.subcategoryId);
        return subcategory ? subcategory.name : category.name;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        
        const unitPrice = typeof product.promoPrice === 'number' ? product.promoPrice : product.originalPrice;

        addToCart({
            productId: product.id,
            name: product.name,
            image: product.images[0]?.url,
            quantity: quantity,
            unitPrice: unitPrice,
            customization: {
                text: customText,
                image: customImage ? 'Imagem Anexada' : undefined,
            }
        });

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    useEffect(() => {
        if (product) {
            document.title = `${product.name} | Gráfica`;
            
            // Update Open Graph tags
            const setMetaTag = (property: string, content: string) => {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            };

            setMetaTag('og:title', product.name);
            setMetaTag('og:description', product.description);
            if (product.images.length > 0) {
                setMetaTag('og:image', product.images[0].url);
            }
            setMetaTag('og:url', window.location.href);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-2xl font-bold">Produto não encontrado</h1>
                    <Link to="/portfolio" className="mt-4 inline-block bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">
                        Voltar para Produtos
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }
    
    const unitPrice = typeof product.promoPrice === 'number' ? product.promoPrice : product.originalPrice;
    const totalPrice = unitPrice * quantity;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 w-fit">
                        <ChevronLeftIcon className="w-5 h-5" />
                        Voltar
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Column */}
                    <div className="bg-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-center aspect-square border border-slate-700">
                        {product.images.length > 0 ? (
                           <img src={product.images[0].url} alt={product.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                           <div className="text-slate-500">Imagem Indisponível</div>
                        )}
                    </div>

                    {/* Details Column */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                                {getCategoryName()}
                            </span>
                            <h1 className="text-4xl font-extrabold text-white mt-3">{product.name}</h1>
                            {typeof product.promoPrice === 'number' ? (
                                <div className="flex items-baseline gap-3 mt-3">
                                    <p className="text-4xl font-bold text-cyan-400">{formatCurrency(product.promoPrice)}</p>
                                    <p className="text-xl text-slate-500 line-through">{formatCurrency(product.originalPrice)}</p>
                                </div>
                            ) : (
                                <p className="text-4xl font-bold text-cyan-400 mt-3">{formatCurrency(product.originalPrice)}</p>
                            )}
                            <p className="text-slate-400 mt-4">{product.description}</p>
                        </div>

                        <div className="bg-slate-800 rounded-xl p-6 space-y-4 border border-slate-700">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-pink-400" />
                                PERSONALIZE AQUI
                            </h3>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 block mb-1">DIGITE O NOME OU FRASE</label>
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Ex: Nome da pessoa..."
                                    className="w-full p-3 bg-slate-700 rounded-md text-sm border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 block mb-1">ANEXAR FOTO (OPCIONAL)</label>
                                <div 
                                    className="w-full bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 min-h-[100px]"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {customImage ? (
                                        <img src={customImage} alt="Preview" className="max-h-24 rounded-md" />
                                    ) : (
                                        <>
                                            <UploadIcon className="w-8 h-8 text-slate-400 mb-1" />
                                            <span className="text-sm text-slate-300">Selecione uma imagem do seu celular</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>
                        
                        <div className="bg-slate-800 rounded-xl p-6 space-y-4 border border-slate-700">
                             <div className="flex justify-between items-center">
                                <label className="font-bold text-white">QUANTIDADE</label>
                                <div className="flex items-center gap-2 bg-slate-700 rounded-md">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 text-xl font-bold text-cyan-400 hover:bg-slate-600 rounded-l-md">-</button>
                                    <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 text-xl font-bold text-cyan-400 hover:bg-slate-600 rounded-r-md">+</button>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm text-slate-400">Total</p>
                                <p className="text-2xl font-bold text-cyan-400">{formatCurrency(totalPrice)}</p>
                             </div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={handleAddToCart} className={`w-full font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all text-lg ${addedToCart ? 'bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                                <ShoppingCartIcon className="w-6 h-6" />
                                {addedToCart ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                            </button>
                            <button 
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: product.name,
                                            text: product.description,
                                            url: window.location.href,
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copiado para a área de transferência!');
                                    }
                                }}
                                className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                Compartilhar Produto
                            </button>
                             <Link to="/portfolio" className="w-full block text-center bg-transparent hover:bg-slate-700 border-2 border-slate-600 text-slate-300 font-bold py-3 px-6 rounded-lg transition-colors">
                                Continuar Comprando
                            </Link>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                     <div className="mt-24 pt-12 border-t border-slate-800">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">Você também pode gostar</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedProducts.map(relatedProduct => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetailPage;
