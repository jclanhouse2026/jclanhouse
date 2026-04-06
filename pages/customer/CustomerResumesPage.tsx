
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import type { ResumeData } from '../../types';
import ResumePreviewModal from '../../components/curriculo/ResumePreviewModal';
import ResumePreview from '../../components/curriculo/ResumePreview';
import EyeIcon from '../../components/icons/EyeIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import DocumentArrowDownIcon from '../../components/icons/DocumentArrowDownIcon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CustomerResumesPage: React.FC = () => {
    const { user } = useAuth();
    const { getRequestsByUserId } = useResume();
    const navigate = useNavigate();

    const userRequests = user ? getRequestsByUserId(user.id) : [];
    
    const [previewingResume, setPreviewingResume] = useState<ResumeData | null>(null);
    const [downloadingResume, setDownloadingResume] = useState<ResumeData | null>(null);
    const downloadContainerRef = useRef<HTMLDivElement>(null);

    const startDownloadPdf = (resumeData: ResumeData) => {
        if (downloadingResume) return;
        setDownloadingResume(resumeData);
    };

    useEffect(() => {
        if (downloadingResume && downloadContainerRef.current) {
            const generatePdf = async () => {
                const content = downloadContainerRef.current;
                if (!content || !downloadingResume) { // Extra guard
                    setDownloadingResume(null);
                    return;
                }

                const canvas = await html2canvas(content, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
                const imgData = canvas.toDataURL('image/png');

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`curriculo_${(downloadingResume.profile.name || 'Curriculo').replace(/\s/g, '_')}.pdf`);

                setDownloadingResume(null);
            };

            const timer = setTimeout(generatePdf, 500);
            return () => clearTimeout(timer);
        }
    }, [downloadingResume]);

    const getStatusClass = (status: 'pending' | 'authorized') => {
        return status === 'authorized' 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-amber-500/20 text-amber-400';
    }

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Meus Currículos</h2>
             {userRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <p>Você ainda não criou nenhum currículo.</p>
                    <button onClick={() => navigate('/curriculo')} className="mt-4 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 text-sm">
                        Criar Novo Currículo
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {userRequests.map(req => (
                         <div key={req.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">Currículo de {req.userName}</p>
                                    <p className="text-xs text-slate-400 mt-1">Solicitado em: {new Date(req.requestedAt).toLocaleString('pt-BR')}</p>
                                </div>
                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>
                                    {req.status === 'pending' ? 'Pendente' : 'Autorizado'}
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                                <button onClick={() => setPreviewingResume(req.resumeData)} className="flex items-center gap-1 text-xs font-semibold bg-slate-600 hover:bg-slate-500 py-1.5 px-3 rounded-md"><EyeIcon className="w-4 h-4"/> Ver Prévia</button>
                                <button onClick={() => navigate(`/curriculo?requestId=${req.id}`)} className="flex items-center gap-1 text-xs font-semibold bg-slate-600 hover:bg-slate-500 py-1.5 px-3 rounded-md"><PencilIcon className="w-4 h-4"/> Editar</button>
                                <button 
                                    onClick={() => startDownloadPdf(req.resumeData)} 
                                    disabled={req.status !== 'authorized' || !!downloadingResume}
                                    className="flex items-center gap-1 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 py-1.5 px-3 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4"/> 
                                    {downloadingResume ? 'Baixando...' : 'Baixar PDF'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {previewingResume && <ResumePreviewModal data={previewingResume} onClose={() => setPreviewingResume(null)} />}
            
            {downloadingResume && (
                <div style={{ position: 'fixed', left: '-9999px', width: '210mm' }}>
                     <div ref={downloadContainerRef} className="bg-white">
                        <ResumePreview data={downloadingResume} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerResumesPage;
