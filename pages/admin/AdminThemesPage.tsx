
import React, { useState } from 'react';
import PhotographIcon from '../../components/icons/PhotographIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import ClipboardListIcon from '../../components/icons/ClipboardListIcon';
import CheckIcon from '../../components/icons/CheckIcon';
import { useThemes } from '../../context/ThemeContext';
import type { Theme, ThemeCategory } from '../../types';
import MultiThemeModal from '../../components/admin/MultiThemeModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

const AdminThemesPage: React.FC = () => {
    const { themes, themeOrders, addTheme, updateTheme, deleteTheme, updateThemeOrderStatus, deleteThemeOrder } = useThemes();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
    const [activeTab, setActiveTab] = useState<'themes' | 'orders'>('themes');
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    
    // Modal de confirmação
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, type: 'single' | 'multiple' | 'order', id?: string}>({ isOpen: false, type: 'single' });

    const cadernetaThemes = themes.filter(t => t.type === 'caderneta' || !t.type);
    const cadernetaOrdersList = themeOrders.filter(o => o.productType === 'caderneta');

    const openModal = (theme: Theme | null = null) => {
        setEditingTheme(theme);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTheme(null);
    };

    const handleDeleteClick = (themeId: string) => {
        setConfirmModal({ isOpen: true, type: 'single', id: themeId });
    };

    const handleDeleteSelectedClick = () => {
        setConfirmModal({ isOpen: true, type: 'multiple' });
    };

    const handleDeleteOrderClick = (orderId: string) => {
        setConfirmModal({ isOpen: true, type: 'order', id: orderId });
    };

    const executeDelete = async () => {
        if (confirmModal.type === 'single' && confirmModal.id) {
            await deleteTheme(confirmModal.id);
            setSelectedThemes(prev => prev.filter(id => id !== confirmModal.id));
        } else if (confirmModal.type === 'multiple') {
            for (const id of selectedThemes) {
                await deleteTheme(id);
            }
            setSelectedThemes([]);
        } else if (confirmModal.type === 'order' && confirmModal.id) {
            await deleteThemeOrder(confirmModal.id);
        }
        setConfirmModal({ isOpen: false, type: 'single' });
    };

    const handleSelectTheme = (themeId: string) => {
        setSelectedThemes(prev => 
            prev.includes(themeId) ? prev.filter(id => id !== themeId) : [...prev, themeId]
        );
    };

    const handleSelectAll = () => {
        if (selectedThemes.length === cadernetaThemes.length) {
            setSelectedThemes([]);
        } else {
            setSelectedThemes(cadernetaThemes.map(t => t.id));
        }
    };
    
    const handleSave = async (themeData: Omit<Theme, 'id'> & { id?: string; file?: File }) => {
        const dataWithType = { ...themeData, type: 'caderneta' as const };
        if (dataWithType.id) {
            await updateTheme(dataWithType as Theme & { file?: File });
        } else {
            await addTheme(dataWithType);
        }
    };
    
    const getCategoryBadge = (category: ThemeCategory) => {
        const styles = {
            'MENINO': 'bg-blue-500/20 text-blue-300',
            'MENINA': 'bg-pink-500/20 text-pink-300',
            'UNISSEX': 'bg-purple-500/20 text-purple-300',
        };
        return (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[category]}`}>
                {category}
            </span>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <PhotographIcon className="w-6 h-6" />
                        Gerenciamento de Temas de Caderneta
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Gerencie as estampas e visualize os pedidos dos clientes.</p>
                </div>
                {activeTab === 'themes' && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {selectedThemes.length > 0 && (
                            <button 
                                onClick={handleDeleteSelectedClick} 
                                className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Excluir ({selectedThemes.length})
                            </button>
                        )}
                        <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" />
                            Adicionar Novos Temas
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
                <button 
                    onClick={() => setActiveTab('themes')}
                    className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'themes' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <PhotographIcon className="w-4 h-4" />
                        Catálogo de Temas
                    </div>
                    {activeTab === 'themes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'orders' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <ClipboardListIcon className="w-4 h-4" />
                        Pedidos Recebidos
                        {cadernetaOrdersList.filter(o => o.status === 'pending').length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {cadernetaOrdersList.filter(o => o.status === 'pending').length}
                            </span>
                        )}
                    </div>
                    {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></div>}
                </button>
            </div>

            {activeTab === 'themes' ? (
                <>
                    {cadernetaThemes.length > 0 && (
                        <div className="flex items-center gap-2 bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <input 
                                type="checkbox" 
                                id="selectAll"
                                checked={selectedThemes.length === cadernetaThemes.length && cadernetaThemes.length > 0}
                                onChange={handleSelectAll}
                                className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-700 cursor-pointer"
                            />
                            <label htmlFor="selectAll" className="text-slate-300 font-medium cursor-pointer select-none">
                                Selecionar Todos
                            </label>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {cadernetaThemes.map(theme => (
                            <div key={theme.id} className={`bg-slate-800 rounded-xl overflow-hidden shadow-lg border transition-all group ${selectedThemes.includes(theme.id) ? 'border-cyan-500 shadow-cyan-500/20' : 'border-slate-700 hover:border-cyan-500/50'}`}>
                                <div className="relative aspect-[4/5]">
                                    <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 z-10">
                                        <input 
                                            type="checkbox"
                                            checked={selectedThemes.includes(theme.id)}
                                            onChange={() => handleSelectTheme(theme.id)}
                                            className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-900/80 backdrop-blur-sm cursor-pointer"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button onClick={() => openModal(theme)} className="bg-white text-slate-900 p-2.5 rounded-full hover:bg-cyan-500 hover:text-white transition-colors shadow-xl">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteClick(theme.id)} className="bg-white text-slate-900 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-xl">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-white truncate text-sm" title={theme.name}>{theme.name}</h3>
                                    <div className="mt-2">{getCategoryBadge(theme.category)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {cadernetaThemes.length === 0 && (
                        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
                            <PhotographIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">Nenhum tema encontrado.</p>
                            <button onClick={() => openModal()} className="mt-4 text-cyan-500 font-bold hover:underline">
                                Adicionar o primeiro tema
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-4">
                    {cadernetaOrdersList.length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
                            <ClipboardListIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">Nenhum pedido recebido ainda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {cadernetaOrdersList.map(order => (
                                <div key={order.id} className={`bg-slate-800 p-4 rounded-xl border transition-all ${order.status === 'pending' ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700'}`}>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                                            <img src={order.themeImageUrl} alt={order.themeName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cliente</p>
                                                <p className="text-white font-bold">{order.customerName}</p>
                                                <p className="text-slate-400 text-sm">{order.customerPhone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pedido / Tema</p>
                                                <p className="text-white font-bold">#{order.orderNumber || 'S/N'}</p>
                                                <p className="text-slate-400 text-sm">{order.themeName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Detalhes</p>
                                                <p className="text-slate-300 text-xs">{order.customizationDetails}</p>
                                            </div>
                                            <div className="flex items-center justify-between lg:justify-end gap-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</p>
                                                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                                        {order.status === 'pending' ? 'Pendente' : 'Concluído'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {order.status === 'pending' && (
                                                        <button 
                                                            onClick={() => updateThemeOrderStatus(order.id, 'completed')}
                                                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                                                            title="Marcar como Concluído"
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteOrderClick(order.id)}
                                                        className="bg-slate-700 text-slate-300 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                                        title="Excluir Pedido"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {isModalOpen && <MultiThemeModal theme={editingTheme} onSave={handleSave} onClose={closeModal} />}
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={
                    confirmModal.type === 'single' ? "Excluir Tema" : 
                    confirmModal.type === 'multiple' ? "Excluir Temas Selecionados" : 
                    "Excluir Pedido"
                }
                message={
                    confirmModal.type === 'single' ? "Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita." : 
                    confirmModal.type === 'multiple' ? `Tem certeza que deseja excluir os ${selectedThemes.length} temas selecionados? Esta ação não pode ser desfeita.` :
                    "Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
                }
                onConfirm={executeDelete}
                onCancel={() => setConfirmModal({ isOpen: false, type: 'single' })}
            />
        </div>
    );
};

export default AdminThemesPage;
