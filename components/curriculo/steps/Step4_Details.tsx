
import React, { useState, useCallback, useRef } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { useCustomers } from '../../../context/CustomerContext';
import { useAuth } from '../../../context/AuthContext';
import { SafeImage } from '../../SafeImage';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import XCircleIcon from '../../icons/XCircleIcon';
import UserIcon from '../../icons/UserIcon';
import CameraIcon from '../../icons/CameraIcon';
import PhotoIcon from '../../icons/ImageIcon';

// Helper function to create a cropped image
const createCroppedImage = (imageSrc: string, crop: Area): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Set the output size (e.g., for a square profile picture)
            const outputSize = 300;
            canvas.width = outputSize;
            canvas.height = outputSize;

            // Draw the cropped image onto the canvas
            ctx.drawImage(
                image,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                outputSize,
                outputSize
            );

            resolve(canvas.toDataURL('image/jpeg', 0.9)); // Return as JPEG with 90% quality
        };
        image.onerror = (error) => reject(error);
    });
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
                console.error('Error cropping image:', e);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex flex-col p-4">
             <div className="flex justify-between items-center pb-4">
                <h3 className="text-lg font-bold text-white">Ajustar Foto</h3>
                <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
            </div>
            <div className="relative flex-1">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1 / 1} // Square aspect ratio for profile picture
                    cropShape="round" // Round crop shape
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="h-24 flex-shrink-0 flex items-center justify-center gap-8">
                 <div className="flex items-center gap-2">
                    <span className="text-sm">Zoom</span>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-32"
                    />
                </div>
                <button onClick={handleCrop} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">
                    Aplicar
                </button>
            </div>
        </div>
    );
};


const Step4_Details: React.FC = () => {
    const { resumeData, updateProfile, updateCnh } = useResume();
    const { customersForCurrentUser } = useCustomers();
    const { user } = useAuth();
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageToCrop(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropComplete = (croppedDataUrl: string) => {
        updateProfile('photo', croppedDataUrl);
        setImageToCrop(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }
    };

    const handleImportPhoto = () => {
        if (customersForCurrentUser.length > 0 && customersForCurrentUser[0].photoURL) {
            updateProfile('photo', customersForCurrentUser[0].photoURL);
        }
    };

    const cnhCategories = ['Não possui', 'A', 'B', 'AB', 'C', 'D', 'E', 'AC', 'AD', 'AE'];

    const cnhLegend = [
        { cat: 'A', desc: 'Motos e triciclos' },
        { cat: 'B', desc: 'Carros de passeio' },
        { cat: 'C', desc: 'Caminhões e veículos de carga (>3,5t)' },
        { cat: 'D', desc: 'Ônibus e vans (>8 passageiros)' },
        { cat: 'E', desc: 'Veículos com reboque, carretas' },
    ];

    return (
        <div className="space-y-8">
            <style>{`
                @keyframes slide-in {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Ótimo! Agora, alguns detalhes finais.</h2>
                <p className="text-slate-400 mt-1">Adicione uma foto e sua CNH, se possuir.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-slate-300 block mb-3">Carteira Nacional de Habilitação (CNH)</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {cnhCategories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => updateCnh('category', cat as any)}
                                    className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-md transition-colors ${
                                        resumeData.profile.cnh.category === cat ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                >
                                    {cat === 'Não possui' ? cat : `Cat. ${cat}`}
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Legenda de Categorias</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {cnhLegend.map(item => (
                                    <div key={item.cat} className="flex gap-2 text-[11px] text-slate-400">
                                        <span className="font-bold text-cyan-500 w-4">{item.cat}:</span>
                                        <span>{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {resumeData.profile.cnh.category !== 'Não possui' && (
                        <div className="animate-[slide-in_0.3s_ease-out]">
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Exerce Atividade Remunerada (EAR)?</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateCnh('ear', true)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                        resumeData.profile.cnh.ear === true ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                >
                                    Sim
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateCnh('ear', false)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                        resumeData.profile.cnh.ear === false ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                >
                                    Não
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                 <div className="flex flex-col items-center space-y-6">
                    <div className="text-center">
                        <label className="text-sm font-semibold text-slate-300 block mb-4">Sua Foto de Perfil</label>
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl relative">
                                <SafeImage src={resumeData.profile.photo} alt="Foto de Perfil" className="w-full h-full object-cover" fallbackType="avatar" />
                                {resumeData.profile.photo && (
                                    <button 
                                        onClick={() => updateProfile('photo', '')}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XCircleIcon className="w-8 h-8 text-white" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-xs space-y-3">
                        {user && customersForCurrentUser.length > 0 && customersForCurrentUser[0].photoURL && (
                            <button 
                                onClick={handleImportPhoto}
                                className="w-full flex items-center justify-center gap-2 bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-cyan-600/30 transition-colors"
                            >
                                <UserIcon className="w-4 h-4" />
                                Usar Foto do Cadastro
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 bg-slate-800 border border-slate-700 p-3 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                <PhotoIcon className="w-5 h-5 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Galeria</span>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                            </button>

                            <button 
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 bg-slate-800 border border-slate-700 p-3 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                <CameraIcon className="w-5 h-5 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Câmera</span>
                                <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="user" onChange={onFileChange} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {imageToCrop && (
                <ImageCropModal 
                    imageSrc={imageToCrop} 
                    onComplete={handleCropComplete}
                    onClose={() => {
                        setImageToCrop(null);
                        if (fileInputRef.current) {
                           fileInputRef.current.value = "";
                        }
                    }} 
                />
            )}
        </div>
    );
};

export default Step4_Details;
