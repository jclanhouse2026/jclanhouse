
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

    const openModal = (theme: Theme | null = null) => {
        setEditingTheme(theme);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTheme(null);
    };

    const handleDelete = (themeId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este tema?')) {
            deleteTheme(themeId);
        }
    };
    
    const handleSave = (themeData: Omit<Theme, 'id'> & { id?: string }) => {
        if (themeData.id) {
            updateTheme(themeData as Theme);
        } else {
            addTheme(themeData);
        }
        closeModal();
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
                {themes.map(theme => (
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
            {themes.length === 0 && (
                <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg">
                    <p>Nenhum tema cadastrado.</p>
                </div>
            )}
            
            {isModalOpen && <ThemeModal theme={editingTheme} onSave={handleSave} onClose={closeModal} />}
        </div>
    );
};


const ImageCropModal: React.FC<{ imageSrc: string; onComplete: (croppedImage: string) => void; onClose: () => void; }> = ({ imageSrc, onComplete, onClose }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    
    const handleCrop = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await createCroppedImage(imageSrc, croppedAreaPixels);
                onComplete(croppedImage);
            } catch (e) {
                console.error('Erro ao cortar imagem:', e);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex flex-col p-4">
            <div className="relative flex-1">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 5}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="h-24 flex-shrink-0 flex items-center justify-center gap-4">
                <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">Cancelar</button>
                <button onClick={handleCrop} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">Aplicar Corte</button>
            </div>
        </div>
    );
};


const ThemeModal: React.FC<{ theme: Theme | null; onSave: (data: Omit<Theme, 'id'> & { id?: string }) => void; onClose: () => void; }> = ({ theme, onSave, onClose }) => {
    const [name, setName] = useState(theme?.name || '');
    const [category, setCategory] = useState<ThemeCategory>(theme?.category || 'UNISSEX');
    
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(theme?.imageUrl || null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageToCrop(reader.result as string);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedDataUrl: string) => {
        setCroppedImage(croppedDataUrl);
        setImageToCrop(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!croppedImage) {
            alert('Por favor, adicione uma imagem para o tema.');
            return;
        }
        onSave({ id: theme?.id, name, imageUrl: croppedImage, category });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">{theme ? 'Editar Tema' : 'Adicionar Novo Tema'}</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Nome do Tema</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" required />
                        </div>
                        
                         <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Imagem do Tema</label>
                            <div 
                                className="aspect-[4/5] w-full max-w-xs mx-auto bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center text-center cursor-pointer hover:border-cyan-500"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {croppedImage ? (
                                    <img src={croppedImage} alt="Preview do tema" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="text-slate-400 p-4">
                                        <UploadIcon className="w-10 h-10 mx-auto" />
                                        <p className="mt-2 text-sm font-semibold">Clique para enviar</p>
                                        <p className="text-xs mt-1">Recomendado: 400x500px</p>
                                    </div>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={onFileChange} 
                            />
                        </div>
                        
                         <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Categoria</label>
                            <select value={category} onChange={e => setCategory(e.target.value as ThemeCategory)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600">
                                <option value="MENINO">Menino</option>
                                <option value="MENINA">Menina</option>
                                <option value="UNISSEX">Unissex</option>
                            </select>
                        </div>
                    </div>
                     <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors mr-2">Cancelar</button>
                        <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">Salvar Tema</button>
                    </div>
                </form>
            </div>
            {imageToCrop && (
                <ImageCropModal 
                    imageSrc={imageToCrop} 
                    onComplete={handleCropComplete}
                    onClose={() => setImageToCrop(null)} 
                />
            )}
        </div>
    );
};

export default AdminSchoolThemesPage;
