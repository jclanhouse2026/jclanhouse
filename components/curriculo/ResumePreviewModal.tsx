
import React from 'react';
import type { ResumeData } from '../../types';
import TemplateModern from './templates/TemplateModern';
import TemplateClassic from './templates/TemplateClassic';
import TemplateCreative from './templates/TemplateCreative';
import TemplateElegant from './templates/TemplateElegant';
import TemplateSidebar from './templates/TemplateSidebar';
import XCircleIcon from '../icons/XCircleIcon';

interface Props {
    data: ResumeData;
    onClose: () => void;
    isStatic?: boolean;
}

const ResumePreviewModal: React.FC<Props> = ({ data, onClose, isStatic = false }) => {
    
    const renderMainPreview = () => {
        switch(data.template) {
            case 'modern': return <TemplateModern data={data} />;
            case 'classic': return <TemplateClassic data={data} />;
            case 'creative': return <TemplateCreative data={data} />;
            case 'elegant': return <TemplateElegant data={data} />;
            case 'sidebar': return <TemplateSidebar data={data} />;
            case 'creative-right': return <TemplateCreative data={data} sidebarPosition="right" />;
            case 'modern-single': return <TemplateModern data={data} layout="single-column" />;
            case 'classic-modern': return <TemplateClassic data={data} fontFamily="Arial, sans-serif" />;
            default: return <p>Modelo não encontrado.</p>;
        }
    }

    if (isStatic) {
        return (
             <div className="bg-white rounded-md p-1 shadow-lg w-full h-full">
                {renderMainPreview()}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] border border-slate-700 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white">Pré-visualização do Currículo</h2>
                    <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                </div>
                <div className="p-4 overflow-y-auto flex-grow bg-slate-900/50">
                    <div className="bg-white rounded-md p-1 shadow-lg max-w-3xl mx-auto">
                        {renderMainPreview()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumePreviewModal;
