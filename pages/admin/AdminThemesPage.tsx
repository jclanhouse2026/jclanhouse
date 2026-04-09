
import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import PhotographIcon from '../../components/icons/PhotographIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import UploadIcon from '../../components/icons/UploadIcon';
import { useThemes } from '../../context/ThemeContext';
import type { Theme, ThemeCategory } from '../../types';
import MultiThemeModal from '../../components/admin/MultiThemeModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

// Função auxiliar para criar a imagem cortada usando Canvas
const createCroppedImage = (imageSrc: string, crop: Area): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Falha ao obter o contexto do canvas'));
                return;
            }

            const outputWidth = 400; // Largura de saída para manter a qualidade
            const outputHeight = 500; // Proporção 4:5
            canvas.width = outputWidth;
            canvas.height = outputHeight;

            ctx.drawImage(
                image,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                outputWidth,
                outputHeight
            );

            resolve(canvas.toDataURL('image/jpeg', 0.9)); // Qualidade de 90%
        };
        image.onerror = (error) => reject(error);
    });
};

const AdminThemesPage: React.FC = () => {
    const { themes, addTheme, updateTheme, deleteTheme } = useThemes();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    
    // Modal de confirmação
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, type: 'single' | 'multiple', id?: string}>({ isOpen: false, type: 'single' });

    const cadernetaThemes = themes.filter(t => t.type === 'caderneta' || !t.type);

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

    const executeDelete = async () => {
        if (confirmModal.type === 'single' && confirmModal.id) {
            await deleteTheme(confirmModal.id);
            setSelectedThemes(prev => prev.filter(id => id !== confirmModal.id));
        } else if (confirmModal.type === 'multiple') {
            for (const id of selectedThemes) {
                await deleteTheme(id);
            }
            setSelectedThemes([]);
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
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <PhotographIcon className="w-6 h-6" />
                    Gerenciamento de Temas de Caderneta
                </h1>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedThemes.length > 0 && (
                        <button 
                            onClick={handleDeleteSelectedClick} 
                            className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Excluir ({selectedThemes.length})
                        </button>
                    )}
                    <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Novo Tema
                    </button>
                </div>
            </div>

            {cadernetaThemes.length > 0 && (
                <div className="mb-4 flex items-center gap-2 bg-slate-800 p-3 rounded-lg border border-slate-700">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cadernetaThemes.map(theme => (
                    <div key={theme.id} className={`bg-slate-800 rounded-xl overflow-hidden shadow-lg border transition-colors group ${selectedThemes.includes(theme.id) ? 'border-cyan-500' : 'border-slate-700'}`}>
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
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={() => openModal(theme)} className="bg-slate-900/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-slate-700"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteClick(theme.id)} className="bg-slate-900/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-red-500/50"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-white truncate">{theme.name}</h3>
                            <div className="mt-2">{getCategoryBadge(theme.category)}</div>
                        </div>
                    </div>
                ))}
            </div>
            {cadernetaThemes.length === 0 && (
                <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg">
                    <p>Nenhum tema cadastrado.</p>
                </div>
            )}
            
            {isModalOpen && <MultiThemeModal theme={editingTheme} onSave={handleSave} onClose={closeModal} />}
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.type === 'single' ? "Excluir Tema" : "Excluir Temas Selecionados"}
                message={confirmModal.type === 'single' 
                    ? "Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita." 
                    : `Tem certeza que deseja excluir os ${selectedThemes.length} temas selecionados? Esta ação não pode ser desfeita.`}
                onConfirm={executeDelete}
                onCancel={() => setConfirmModal({ isOpen: false, type: 'single' })}
            />
        </div>
    );
};

export default AdminThemesPage;
