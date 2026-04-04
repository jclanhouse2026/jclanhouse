
import React from 'react';
import type { ResumeData } from '../../types';
import TemplateModern from './templates/TemplateModern';
import TemplateClassic from './templates/TemplateClassic';
import TemplateCreative from './templates/TemplateCreative';
import TemplateElegant from './templates/TemplateElegant';
import TemplateSidebar from './templates/TemplateSidebar';

interface Props {
    data: ResumeData;
}

const ResumePreview: React.FC<Props> = ({ data }) => {
    switch(data.template) {
        case 'modern': return <TemplateModern data={data} />;
        case 'classic': return <TemplateClassic data={data} />;
        case 'creative': return <TemplateCreative data={data} />;
        case 'elegant': return <TemplateElegant data={data} />;
        case 'sidebar': return <TemplateSidebar data={data} />;
        case 'creative-right': return <TemplateCreative data={data} sidebarPosition="right" />;
        case 'modern-single': return <TemplateModern data={data} layout="single-column" />;
        case 'classic-modern': return <TemplateClassic data={data} fontFamily="Arial, sans-serif" />;
        default: return <p className="text-center p-8 text-slate-600">Selecione um modelo para visualizar.</p>;
    }
};

export default ResumePreview;