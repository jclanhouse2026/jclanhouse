import React, { useState, useEffect } from 'react';
import { useMyWorks, MyWork } from '../../context/MyWorksContext';
import PlayCircleIcon from '../../components/icons/PlayCircleIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import RefreshIcon from '../../components/icons/RefreshIcon';

// Helper function to safely get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string => {
    const placeholder = 'https://placehold.co/600x400/1e293b/94a3b8?text=Video';
    if (!url || typeof url !== 'string') {
        return placeholder;
    }
    try {
        const urlObj = new URL(url);
        let videoId = '';
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v') || '';
        }

        if (videoId) {
            if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }
        }
    } catch (e) {
        console.warn("Não foi possível analisar a URL do vídeo, usando imagem padrão:", url);
    }
    return placeholder;
};


const WorkModal: React.FC<{
    work: Partial<MyWork> | null;
    onClose: () => void;
    onSave: (data: Omit<MyWork, 'id' | 'created_at'>) => void;
    isSaving: boolean;
}> = ({ work, onClose, onSave, isSaving }) => {
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (work) {
            setTitle(work.title || '');
            setVideoUrl(work.video_url || '');
            setThumbnailUrl(work.thumbnail_url || '');
            setDescription(work.description || '');
        }
    }, [work]);
    
    const handleSaveClick = () => {
        if (!title || !videoUrl) {
            alert("Campos 'Título' e 'URL do Vídeo' são obrigatórios.");
            return;
        }
        onSave({ 
            title, 
            video_url: videoUrl, 
            thumbnail_url: thumbnailUrl,
            description 
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
                <div>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">{work ? 'Editar Trabalho' : 'Adicionar Novo Trabalho'}</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <ControlledInputField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <ControlledInputField label="URL do Vídeo (YouTube)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required />
                        <ControlledInputField label="URL da Miniatura (Opcional)" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://i.ytimg.com/vi/.../hqdefault.jpg" />
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Descrição</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600"></textarea>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg mr-2">Cancelar</button>
                        <button type="button" id="saveVideoBtn" onClick={handleSaveClick} disabled={isSaving} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-slate-600 disabled:cursor-wait">
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControlledInputField: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; required?: boolean; placeholder?: string; }> = ({ value, onChange, label, required, placeholder }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        <input type="text" value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" />
    </div>
);


const AdminMyWorksPage: React.FC = () => {
    const { works, addWork, updateWork, deleteWork, error, refetchWorks } = useMyWorks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState<MyWork | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const openModal = (work: MyWork | null = null) => {
        setEditingWork(work);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWork(null);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetchWorks();
        } catch (e) {
            console.error("Falha ao atualizar trabalhos", e);
        } finally {
            setIsRefreshing(false);
        }
    };

    async function handleSave(workData: Omit<MyWork, 'id' | 'created_at'>) {
        setIsSaving(true);
        try {
            if (editingWork) {
                await updateWork({ id: editingWork.id, ...workData });
            } else {
                await addWork(workData);
            }
            
            alert(editingWork ? "Trabalho atualizado com sucesso!" : "Vídeo salvo com sucesso!");
            closeModal();

        } catch (err) {
            console.error("Erro ao salvar trabalho:", err);
            alert(`Erro ao salvar: ${err instanceof Error ? err.message : 'Erro desconhecido.'}`);
        } finally {
            setIsSaving(false);
        }
    }

    const handleDelete = async (workId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este trabalho?')) {
            try {
                await deleteWork(workId);
            } catch (err: any) {
                console.error("Failed to delete work:", err);
                alert("Erro ao excluir trabalho: " + err.message);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <PlayCircleIcon className="w-6 h-6" />
                    Meus Trabalhos (Vídeos)
                </h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleRefresh} disabled={isRefreshing} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:bg-slate-700/50 disabled:cursor-wait">
                        <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Atualizar
                    </button>
                    <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Novo Trabalho
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6 border border-red-500/30">
                    <p className="font-bold">Ocorreu um erro ao carregar os trabalhos:</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-2">Verifique se a tabela `my_works` foi criada corretamente no seu banco de dados Supabase.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {works.map(work => (
                    <div key={work.id} className="bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700">
                        <img src={work.thumbnail_url || getYouTubeThumbnail(work.video_url)} alt={work.title} className="w-full h-40 object-cover" onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=Video'} />
                        <div className="p-4">
                            <h3 className="font-bold text-white truncate">{work.title}</h3>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{work.description}</p>
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => openModal(work)} className="p-2 text-slate-400 hover:text-white"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(work.id)} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {works.length === 0 && !error && (
                <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg">
                    <p>Nenhum trabalho adicionado ainda.</p>
                </div>
            )}

            {isModalOpen && <WorkModal work={editingWork} onClose={closeModal} onSave={handleSave} isSaving={isSaving} />}
        </div>
    );
};

export default AdminMyWorksPage;