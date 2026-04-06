import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../../context/ResumeContext';
import type { ResumeRequest, ResumeData } from '../../../types';
import ResumePreviewModal from '../../curriculo/ResumePreviewModal';
import ResumePreview from '../../curriculo/ResumePreview';
import EyeIcon from '../../icons/EyeIcon';
import PencilIcon from '../../icons/PencilIcon';
import DocumentArrowDownIcon from '../../icons/DocumentArrowDownIcon';
import CheckIcon from '../../icons/CheckIcon';
import TrashIcon from '../../icons/TrashIcon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResumeRequestsList: React.FC = () => {
    const { getAllRequests, updateRequestStatus, deleteResumeRequest } = useResume();
    const navigate = useNavigate();
    const requests = getAllRequests();
    
    const [previewingResume, setPreviewingResume] = useState<ResumeData | null>(null);
    const [downloadingResume, setDownloadingResume] = useState<ResumeData | null>(null);
    const downloadContainerRef = useRef<HTMLDivElement>(null);

    const handleAuthorize = async (id: string) => {
        try {
            await updateRequestStatus(id, 'authorized');
        } catch (error) {
            console.error("Failed to authorize resume request:", error);
            alert("Não foi possível autorizar a solicitação.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteResumeRequest(id);
        } catch (error) {
            console.error("Failed to delete resume request:", error);
            alert("Não foi possível excluir a solicitação.");
        }
    };
    
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
                };

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
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Solicitações de Download de Currículo</h3>
            {requests.length === 0 ? (
                 <div className="bg-slate-700/50 p-8 rounded-lg text-center text-slate-400">
                    <p>Nenhuma solicitação encontrada.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
                                <div>
                                    <p className="font-bold text-white">{req.userName}</p>
                                    <p className="text-sm text-slate-400">{req.userWhatsapp}</p>
                                    <p className="text-xs text-slate-500 mt-1">Pedido em: {new Date(req.requestedAt).toLocaleString('pt-BR')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>
                                        {req.status === 'pending' ? 'Pendente' : 'Autorizado'}
                                    </span>
                                    {req.status === 'pending' && (
                                        <button onClick={() => handleAuthorize(req.id)} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-500/40" title="Autorizar">
                                            <CheckIcon className="w-5 h-5"/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                                <button onClick={() => setPreviewingResume(req.resumeData)} className="flex items-center gap-1 text-xs font-semibold bg-slate-600 hover:bg-slate-500 py-1.5 px-3 rounded-md"><EyeIcon className="w-4 h-4"/> Ver</button>
                                <button onClick={() => navigate(`/curriculo?requestId=${req.id}`)} className="flex items-center gap-1 text-xs font-semibold bg-slate-600 hover:bg-slate-500 py-1.5 px-3 rounded-md"><PencilIcon className="w-4 h-4"/> Editar</button>
                                <button onClick={() => startDownloadPdf(req.resumeData)} disabled={!!downloadingResume} className="flex items-center gap-1 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 py-1.5 px-3 rounded-md disabled:bg-slate-600">
                                    <DocumentArrowDownIcon className="w-4 h-4"/> 
                                    {downloadingResume ? 'Baixando...' : 'Baixar PDF'}
                                </button>
                                <button onClick={() => handleDelete(req.id)} className="flex items-center gap-1 text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/40 py-1.5 px-3 rounded-md">
                                    <TrashIcon className="w-4 h-4"/> Excluir
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

export default ResumeRequestsList;