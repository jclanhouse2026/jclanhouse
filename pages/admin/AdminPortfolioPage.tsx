
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CollectionIcon from '../../components/icons/CollectionIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import UploadIcon from '../../components/icons/UploadIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon';
import { usePortfolio } from '../../context/PortfolioContext';
import { useCategories } from '../../context/CategoryContext';
import type { PortfolioProduct, PortfolioImage } from '../../types';
import { formatCurrency } from '../../lib/formatters';

const AdminPortfolioPage: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = usePortfolio();
    const { categories } = useCategories();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<PortfolioProduct | null>(null);

    const openModal = (product: PortfolioProduct | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = (productId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            deleteProduct(productId);
        }
    };
    
    const handleSave = async (productData: Omit<PortfolioProduct, 'id'> & { id?: string }) => {
        try {
            if (productData.id) {
                await updateProduct(productData as PortfolioProduct);
            } else {
                await addProduct(productData);
            }
            closeModal();
        } catch (error) {
            alert(`Erro ao salvar o produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const getCategoryName = (product: PortfolioProduct) => {
        const category = categories.find(c => c.id === product.categoryId);
        if (!category) return 'Sem Categoria';
        const subcategory = category.subcategories.find(s => s.id === product.subcategoryId);
        return subcategory ? `${category.name} / ${subcategory.name}` : category.name;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CollectionIcon className="w-6 h-6" />
                    Gerenciamento de Produtos
                </h1>
                <div className="flex items-center gap-4">
                    <Link to="/pdv" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <ChevronLeftIcon className="w-5 h-5" />
                        Voltar para o PDV
                    </Link>
                    <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Novo Produto
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700 text-sm text-slate-400">
                                <th className="py-3 pr-3 w-20">Imagem</th>
                                <th className="py-3 px-3">Nome do Produto</th>
                                <th className="py-3 px-3">Categoria</th>
                                <th className="py-3 px-3">Preço</th>
                                <th className="py-3 pl-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                                    <td className="py-3 pr-3">
                                        {product.images.length > 0 && (
                                            <img src={product.images[0].url} alt={product.name} className="w-14 h-14 rounded-md object-cover" />
                                        )}
                                    </td>
                                    <td className="py-3 px-3 font-medium text-white">{product.name || 'Produto sem nome'}</td>
                                    <td className="py-3 px-3 text-sm text-slate-400">{getCategoryName(product)}</td>
                                    <td className="py-3 px-3">
                                        {typeof product.promoPrice === 'number' ? (
                                            <div>
                                                <span className="text-lg font-bold text-emerald-400">{formatCurrency(product.promoPrice)}</span>
                                                <span className="ml-2 text-sm text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-lg font-bold text-white">{formatCurrency(product.originalPrice)}</span>
                                        )}
                                    </td>
                                    <td className="py-3 pl-3 text-right">
                                        <button onClick={() => openModal(product)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-slate-700"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <ProductModal product={editingProduct} onSave={handleSave} onClose={closeModal} />}
        </div>
    );
};

// --- ProductModal Component ---
const ProductModal: React.FC<{ product: PortfolioProduct | null; onSave: (data: Omit<PortfolioProduct, 'id'> & { id?: string }) => Promise<void>; onClose: () => void; }> = ({ product, onSave, onClose }) => {
    const { categories } = useCategories();

    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || 0);
    const [promoPrice, setPromoPrice] = useState(product?.promoPrice?.toString() ?? '');
    const [type, setType] = useState<'kit' | 'unique'>(product?.type || 'unique');
    const [images, setImages] = useState<PortfolioImage[]>(product?.images || []);
    const [categoryId, setCategoryId] = useState<string>(product?.categoryId?.toString() || '');
    const [subcategoryId, setSubcategoryId] = useState<string>(product?.subcategoryId?.toString() || '');
    
    const availableSubcategories = useMemo(() => {
        if (!categoryId) return [];
        const selectedCat = categories.find(c => c.id === categoryId);
        return selectedCat?.subcategories || [];
    }, [categoryId, categories]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryId(e.target.value);
        setSubcategoryId(''); // Reset subcategory when category changes
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImages = files.map((file: File) => ({ id: (Date.now() + Math.random()).toString(), url: URL.createObjectURL(file), file }));
            if(images.length + newImages.length > 5) {
                alert('Você pode enviar no máximo 5 imagens.');
                return;
            }
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (id: string) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(images.length === 0) {
            alert('Adicione pelo menos uma imagem.');
            return;
        }
        await onSave({
            id: product?.id,
            name,
            description,
            originalPrice,
            promoPrice: promoPrice === '' ? undefined : Number(promoPrice),
            type,
            images,
            categoryId: categoryId ? categoryId : undefined,
            subcategoryId: subcategoryId ? subcategoryId : undefined
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl my-8 border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Nome do Produto</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" required/>
                        </div>

                        <div>
                             <label className="text-sm font-bold text-slate-300 block mb-2">Imagens (até 5)</label>
                             <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                                {images.map(img => (
                                    <div key={img.id} className="relative aspect-square">
                                        <img src={img.url} alt="preview" className="w-full h-full object-cover rounded-md" />
                                        <button type="button" onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><XCircleIcon className="w-5 h-5" /></button>
                                    </div>
                                ))}
                             </div>
                             <label htmlFor="imageUpload" className="w-full bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500">
                                <UploadIcon className="w-8 h-8 text-slate-400 mb-1" />
                                <span className="font-semibold text-slate-300">Clique para adicionar imagens</span>
                                <span className="text-xs text-slate-500">{images.length}/5 imagens selecionadas</span>
                             </label>
                             <input id="imageUpload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-slate-300 block mb-2">Categoria Principal</label>
                                <select value={categoryId} onChange={handleCategoryChange} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600">
                                    <option value="">Nenhuma</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-bold text-slate-300 block mb-2">Subcategoria</label>
                                <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" disabled={availableSubcategories.length === 0}>
                                    <option value="">Nenhuma</option>
                                    {availableSubcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Descrição</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600"></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-slate-300 block mb-2">Valor Original (R$)</label>
                                <input type="number" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" required/>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-300 block mb-2">Valor Promocional (R$) <span className="text-xs text-slate-400">(Opcional)</span></label>
                                <input type="number" step="0.01" value={promoPrice} onChange={e => setPromoPrice(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors mr-2">Cancelar</button>
                        <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">Salvar Produto</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPortfolioPage;
