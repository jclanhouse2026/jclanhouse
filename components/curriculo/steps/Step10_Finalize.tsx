import React, { useState, useRef } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { useAuth } from '../../../context/AuthContext';
import { useCustomers } from '../../../context/CustomerContext';
import { useNavigate } from 'react-router-dom';
import ResumePreview from '../ResumePreview';
import XCircleIcon from '../../icons/XCircleIcon';
import CheckBadgeIcon from '../../icons/CheckBadgeIcon';

const AuthorizationRequestModal: React.FC<{
    onClose: () => void;
    onSubmit: (details: { name: string; whatsapp: string }) => void;
}> = ({ onClose, onSubmit }) => {
    const { user } = useAuth();
    const { customersForCurrentUser } = useCustomers();
    const currentUserCustomer = customersForCurrentUser.find(c => c.userId === user?.id);

    const [name, setName] = useState(user?.name || currentUserCustomer?.fullName || '');
    const [whatsapp, setWhatsapp] = useState(currentUserCustomer?.phone || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, whatsapp });
    };
    
    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">Solicitar Autorização</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-400">Para baixar o PDF, precisamos que um administrador autorize seu pedido. Por favor, preencha seus dados para a solicitação.</p>
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Seu Nome Completo</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md" required />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Seu WhatsApp</label>
                            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(formatPhone(e.target.value))} className="w-full p-3 bg-slate-700 rounded-md" placeholder="(XX) XXXXX-XXXX" required />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg">
                            Enviar Solicitação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Step10_Finalize: React.FC = () => {
    const { 
        resumeData, setTemplate, setTemplateColor, setFontSize, setLineHeight, 
        setAlignment, setFontTitle, setFontBody, resumeConfig, addResumeRequest 
    } = useResume();
    const navigate = useNavigate();
    const { templates, colors, lineHeights, fontSizes } = resumeConfig;
    
    const resumePreviewRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestStatus, setRequestStatus] = useState<'idle' | 'requesting' | 'requested'>('idle');

    const fonts = [
        { id: 'Inter', name: 'Inter' },
        { id: 'Roboto', name: 'Roboto' },
        { id: 'Open Sans', name: 'Open Sans' },
        { id: 'Playfair Display', name: 'Playfair' },
        { id: 'Montserrat', name: 'Montserrat' },
        { id: 'Lato', name: 'Lato' },
        { id: 'Merriweather', name: 'Merriweather' },
    ];

    const alignments = [
        { id: 'left', name: 'Esquerda' },
        { id: 'center', name: 'Centro' },
        { id: 'right', name: 'Direita' },
        { id: 'justify', name: 'Justificado' },
    ];

    const handleRequestAuthorization = async (details: { name: string; whatsapp: string }) => {
        setRequestStatus('requesting');
        try {
          await addResumeRequest({
            userName: details.name,
            userWhatsapp: details.whatsapp,
          });
          setRequestStatus('requested');
        } catch(e) {
          console.error(e);
          alert("Ocorreu um erro ao enviar a solicitação. Tente novamente.");
          setRequestStatus('idle');
        } finally {
            setIsModalOpen(false);
        }
      };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Seu currículo está pronto!</h2>
                <p className="text-slate-400 mt-1">Faça os ajustes finais e solicite a autorização para download.</p>
            </div>
            
            <div className="space-y-4 bg-slate-700/50 p-4 rounded-lg">
                <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Modelo</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {templates.map(t => <button key={t.id} onClick={() => setTemplate(t.id as any)} className={`py-2 text-xs font-semibold rounded-md ${resumeData.template === t.id ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{t.name}</button>)}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Cor de Destaque</label>
                        <div className="flex gap-2 flex-wrap">
                            {colors.map(c => <button key={c} onClick={() => setTemplateColor(c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full ${resumeData.templateColor === c ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : ''}`}></button>)}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Alinhamento do Texto</label>
                        <div className="grid grid-cols-2 gap-2">
                            {alignments.map(a => <button key={a.id} onClick={() => setAlignment(a.id as any)} className={`py-2 text-xs font-semibold rounded-md ${resumeData.alignment === a.id ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{a.name}</button>)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-600">
                    <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Fonte dos Títulos</label>
                        <select 
                            value={resumeData.fontTitle} 
                            onChange={(e) => setFontTitle(e.target.value)}
                            className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white"
                        >
                            {fonts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Fonte do Texto</label>
                        <select 
                            value={resumeData.fontBody} 
                            onChange={(e) => setFontBody(e.target.value)}
                            className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600 text-white"
                        >
                            {fonts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-600">
                    <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Tamanho da Fonte</label>
                         <div className="flex gap-2 flex-wrap">
                            {fontSizes.map(fs => <button key={fs.id} onClick={() => setFontSize(fs.id)} className={`flex-1 py-2 text-xs font-semibold rounded-md ${resumeData.fontSize === fs.id ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{fs.name}</button>)}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Espaçamento</label>
                        <div className="flex gap-2 flex-wrap">
                            {lineHeights.map(lh => <button key={lh.id} onClick={() => setLineHeight(lh.id as any)} className={`flex-1 py-2 text-xs font-semibold rounded-md ${resumeData.lineHeight === lh.id ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{lh.name}</button>)}
                        </div>
                    </div>
                </div>
            </div>

            {(() => {
                if (requestStatus === 'requested') {
                    return (
                        <div className="text-center bg-emerald-500/20 p-4 rounded-lg border border-emerald-500/30">
                            <CheckBadgeIcon className="w-10 h-10 mx-auto text-emerald-400 mb-2"/>
                            <p className="font-bold text-emerald-300">Solicitação enviada com sucesso!</p>
                            <p className="text-sm text-slate-300 mt-1">Aguarde a autorização do administrador para fazer o download.</p>
                            <p className="text-sm text-slate-400 mt-2">Você pode acompanhar o status do seu pedido no seu painel.</p>
                            <button onClick={() => navigate('/cliente/curriculos')} className="mt-4 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 text-sm">
                                Ir para Meus Currículos
                            </button>
                        </div>
                    );
                }

                return (
                    <button onClick={() => setIsModalOpen(true)} disabled={requestStatus === 'requesting'} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-wait">
                        {requestStatus === 'requesting' ? 'Enviando...' : 'Solicitar Autorização para Baixar'}
                    </button>
                );
            })()}

            <div className="w-full flex justify-center py-4">
                <div className="w-[800px] origin-top transform scale-[0.4] sm:scale-[0.7] lg:scale-[0.9]">
                    <div className="bg-white rounded-md p-1 shadow-2xl">
                        <div ref={resumePreviewRef}>
                           <ResumePreview data={resumeData} />
                        </div>
                    </div>
                </div>
            </div>
            
            {isModalOpen && <AuthorizationRequestModal onClose={() => setIsModalOpen(false)} onSubmit={handleRequestAuthorization} />}
        </div>
    );
};

export default Step10_Finalize;