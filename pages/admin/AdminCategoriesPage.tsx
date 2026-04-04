
import React, { useState } from 'react';
import TagIcon from '../../components/icons/TagIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import { useCategories } from '../../context/CategoryContext';
import type { Category, Subcategory } from '../../types';

const AdminCategoriesPage: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory } = useCategories();
    
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'add' | 'edit';
        type: 'category' | 'subcategory';
        item?: Category | Subcategory;
        parentId?: string | null;
    }>({ isOpen: false, mode: 'add', type: 'category' });

    const openModal = (
        mode: 'add' | 'edit',
        type: 'category' | 'subcategory',
        item?: Category | Subcategory,
        parentId?: string | null
    ) => {
        setModalState({ isOpen: true, mode, type, item, parentId });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: 'add', type: 'category' });
    };

    const handleSave = async (name: string) => {
        const { mode, type, item, parentId } = modalState;

        try {
            if (mode === 'add') {
                if (type === 'category') {
                    await addCategory(name);
                } else if (type === 'subcategory' && parentId) {
                    await addSubcategory(parentId, name);
                }
            } else { // edit mode
                if (type === 'category' && item) {
                    await updateCategory(item.id, name);
                } else if (type === 'subcategory' && item && parentId) {
                    await updateSubcategory(parentId, item.id, name);
                }
            }
            closeModal();
        } catch (error) {
            console.error("Falha ao salvar categoria/subcategoria:", error);
            alert(`Erro: ${error instanceof Error ? error.message : 'Ocorreu um problema ao salvar.'}`);
        }
    };
    
    const handleDelete = (type: 'category' | 'subcategory', id: string, parentId?: string) => {
        const confirmMsg = type === 'category'
            ? 'Tem certeza que deseja excluir esta categoria e todas as suas subcategorias?'
            : 'Tem certeza que deseja excluir esta subcategoria?';

        if(window.confirm(confirmMsg)) {
            if (type === 'category') {
                deleteCategory(id);
            } else if (type === 'subcategory' && parentId) {
                 deleteSubcategory(parentId, id);
            }
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <TagIcon className="w-6 h-6" />
                    Gerenciamento de Categorias
                </h1>
                <button onClick={() => openModal('add', 'category')} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Nova Categoria
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="space-y-4">
                    {categories.map(category => (
                        <div key={category.id} className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-white">{category.name}</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openModal('add', 'subcategory', undefined, category.id)} className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-2 rounded-md">Adicionar Subcategoria</button>
                                    <button onClick={() => openModal('edit', 'category', category)} className="p-2 text-slate-400 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete('category', category.id)} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {category.subcategories.length > 0 && (
                                <div className="mt-3 pl-6 border-l-2 border-slate-600 space-y-2">
                                    {category.subcategories.map(sub => (
                                        <div key={sub.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                                            <p className="text-sm text-slate-300">{sub.name}</p>
                                             <div className="flex items-center gap-2">
                                                <button onClick={() => openModal('edit', 'subcategory', sub, category.id)} className="p-2 text-slate-400 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete('subcategory', sub.id, category.id)} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                     {categories.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <p>Nenhuma categoria cadastrada.</p>
                            <p className="text-sm mt-1">Clique em "Adicionar Nova Categoria" para começar.</p>
                        </div>
                    )}
                </div>
            </div>
            {modalState.isOpen && <CategoryModal {...modalState} onSave={handleSave} onClose={closeModal} />}
        </div>
    );
};


// --- CategoryModal Component ---
const CategoryModal: React.FC<{
    mode: 'add' | 'edit';
    type: 'category' | 'subcategory';
    item?: Category | Subcategory;
    onSave: (name: string) => void;
    onClose: () => void;
}> = ({ mode, type, item, onSave, onClose }) => {
    const [name, setName] = useState(item?.name || '');
    
    const title = `${mode === 'add' ? 'Adicionar' : 'Editar'} ${type === 'category' ? 'Categoria' : 'Subcategoria'}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">{title}</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6">
                         <label className="text-sm font-bold text-slate-300 block mb-2">Nome</label>
                         <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500"
                            required
                            autoFocus
                        />
                    </div>
                     <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors mr-2">Cancelar</button>
                        <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminCategoriesPage;
