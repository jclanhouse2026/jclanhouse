import React, { useState, useRef } from 'react';
import XCircleIcon from '../icons/XCircleIcon';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';
import type { Theme, ThemeCategory } from '../../types';
import { optimizeImage } from '../../lib/imageUtils';

interface ThemeDraft {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  category: ThemeCategory;
}

interface MultiThemeModalProps {
  theme: Theme | null; // If editing a single existing theme
  onSave: (data: Omit<Theme, 'id'> & { id?: string; file?: File }) => Promise<void>;
  onClose: () => void;
  type?: 'escolar' | 'caneca' | 'caderneta';
}

const MultiThemeModal: React.FC<MultiThemeModalProps> = ({ theme, onSave, onClose, type = 'escolar' }) => {
  const [drafts, setDrafts] = useState<ThemeDraft[]>(
    theme ? [{
      id: theme.id,
      previewUrl: theme.imageUrl,
      name: theme.name,
      category: theme.category
    }] : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files) as File[];
    // Clear input so same files can be selected again
    e.target.value = '';

    const newDrafts: ThemeDraft[] = [];

    for (const file of files) {
      const draftId = Date.now().toString() + Math.random().toString();
      
      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Use filename as initial name (without extension)
      const initialName = file.name.split('.').slice(0, -1).join('.') || 'Novo Tema';
      
      const draft: ThemeDraft = {
        id: draftId,
        file,
        previewUrl,
        name: initialName,
        category: 'UNISSEX'
      };
      newDrafts.push(draft);
    }

    setDrafts(prev => [...prev, ...newDrafts]);

    // Optimize images asynchronously
    for (const draft of newDrafts) {
      try {
        // Optimize image
        const optimizedFile = await optimizeImage(draft.file!, 800, 1000, 0.8);
        
        // Update draft with optimized file
        setDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, file: optimizedFile } : d));
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
      }
    }
  };

  const handleNameChange = (id: string, newName: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
  };

  const handleCategoryChange = (id: string, newCategory: ThemeCategory) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, category: newCategory } : d));
  };

  const removeDraft = (id: string) => {
    setDrafts(prev => prev.map(d => {
      if (d.id === id && d.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(d.previewUrl);
      }
      return d;
    }).filter(d => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (drafts.length === 0) {
      alert('Por favor, adicione pelo menos uma imagem.');
      return;
    }

    setIsSaving(true);
    try {
      for (const draft of drafts) {
        if (!draft.previewUrl) continue;
        
        if (draft.previewUrl.startsWith('blob:') && !draft.file) {
          console.error("Tentativa de salvar URL blob sem arquivo no MultiThemeModal");
          throw new Error(`Erro na imagem do tema "${draft.name}". Por favor, selecione o arquivo novamente.`);
        }

        // If it's a new file, we use the base64 previewUrl which was generated after optimization
        // If it's an existing theme, previewUrl is the existing URL
        await onSave({
          id: theme ? theme.id : undefined,
          name: draft.name,
          imageUrl: draft.previewUrl,
          category: draft.category,
          type: type,
          file: draft.file
        });
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar temas:", error);
      alert("Erro ao salvar temas. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl my-8 border border-slate-700">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10 rounded-t-xl">
            <h2 className="text-lg font-bold text-white">{theme ? 'Editar Tema' : 'Adicionar Novos Temas'}</h2>
            <button type="button" onClick={onClose} disabled={isSaving}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
          </div>
          
          <div className="p-6 space-y-6">
            {!theme && (
              <div>
                <label className="text-sm font-bold text-slate-300 block mb-2">Adicionar Imagens</label>
                <div 
                  className="w-full bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="text-lg font-semibold text-white">Clique para selecionar imagens</p>
                  <p className="text-sm text-slate-400 mt-1">Você pode selecionar várias imagens de uma vez.</p>
                  <p className="text-xs text-slate-500 mt-2">As imagens serão otimizadas automaticamente.</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  multiple
                  onChange={handleFileChange} 
                />
              </div>
            )}

            {drafts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-md font-bold text-white border-b border-slate-700 pb-2">
                  {theme ? 'Detalhes do Tema' : `Temas Selecionados (${drafts.length})`}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drafts.map(draft => (
                    <div key={draft.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 relative group">
                      {!theme && (
                        <button 
                          type="button" 
                          onClick={() => removeDraft(draft.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg hover:bg-red-600"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      
                      <div className="aspect-[4/5] w-full bg-slate-800 rounded-md mb-3 overflow-hidden relative">
                        <img src={draft.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Nome</label>
                          <input 
                            type="text" 
                            value={draft.name} 
                            onChange={e => handleNameChange(draft.id, e.target.value)} 
                            className="w-full p-2 bg-slate-800 rounded text-sm text-white border border-slate-600 focus:border-cyan-500 focus:outline-none" 
                            required 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Categoria</label>
                          {type === 'caneca' ? (
                            <input 
                              type="text" 
                              value={draft.category} 
                              onChange={e => handleCategoryChange(draft.id, e.target.value)} 
                              className="w-full p-2 bg-slate-800 rounded text-sm text-white border border-slate-600 focus:border-cyan-500 focus:outline-none" 
                              placeholder="Ex: Dia das Mães"
                              required 
                            />
                          ) : (
                            <select 
                              value={draft.category} 
                              onChange={e => handleCategoryChange(draft.id, e.target.value as ThemeCategory)} 
                              className="w-full p-2 bg-slate-800 rounded text-sm text-white border border-slate-600 focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="MENINO">Menino</option>
                              <option value="MENINA">Menina</option>
                              <option value="UNISSEX">Unissex</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-800 border-t border-slate-700 text-right sticky bottom-0 rounded-b-xl flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving}
              className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving || drafts.length === 0}
              className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> Salvando...</>
              ) : (
                'Salvar Temas'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiThemeModal;
