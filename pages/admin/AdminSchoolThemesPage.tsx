
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

const AdminSchoolThemesPage: React.FC = () => {
    const { themes, addTheme, updateTheme, deleteTheme } = useThemes();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

    const escolarThemes = themes.filter(t => t.type === 'escolar');

    const openModal = (theme: Theme | null = null) => {
        setEditingTheme(theme);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTheme(null);
    };

    const handleDelete = (themeId: string) => {
        deleteTheme(themeId);
    };
    
    const handleSave = async (themeData: Omit<Theme, 'id'> & { id?: string }) => {
        const dataWithType = { ...themeData, type: 'escolar' as const };
        if (dataWithType.id) {
            await updateTheme(dataWithType as Theme);
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <PhotographIcon className="w-6 h-6" />
                    Gerenciamento de Temas Escolares
                </h1>
                <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Novo Tema
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {escolarThemes.map(theme => (
                    <div key={theme.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 group">
                        <div className="relative aspect-[4/5]">
                            <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={() => openModal(theme)} className="bg-slate-900/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-slate-700"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(theme.id)} className="bg-slate-900/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-red-500/50"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-white truncate">{theme.name}</h3>
                            <div className="mt-2">{getCategoryBadge(theme.category)}</div>
                        </div>
                    </div>
                ))}
            </div>
            {escolarThemes.length === 0 && (
                <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg">
                    <p>Nenhum tema cadastrado.</p>
                </div>
            )}
            
            {isModalOpen && <MultiThemeModal theme={editingTheme} onSave={handleSave} onClose={closeModal} />}
        </div>
    );
};

export default AdminSchoolThemesPage;
