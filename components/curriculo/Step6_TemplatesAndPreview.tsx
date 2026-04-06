
import React, { useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import TemplateModern from './templates/TemplateModern';
import TemplateClassic from './templates/TemplateClassic';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const templates = [
    { id: 'modern', name: 'Moderno' },
    { id: 'classic', name: 'Clássico' },
];

const Step6TemplatesAndPreview: React.FC = () => {
    const { resumeData, setTemplate } = useResume();
    const resumePreviewRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const content = resumePreviewRef.current;
        if (!content) return;

        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow?.document.write('<html><head><title>Currículo</title>');
        printWindow?.document.write('<style>body { font-family: sans-serif; } @page { size: A4; margin: 0; } .resume-container { transform-origin: top left; transform: scale(0.9); } </style>');
        printWindow?.document.write('</head><body>');
        printWindow?.document.write(`<div class="resume-container">${content.innerHTML}</div>`);
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.focus();
        setTimeout(() => {
            printWindow?.print();
            printWindow?.close();
        }, 250);
    };
    
    const handleDownloadPdf = async () => {
        const content = resumePreviewRef.current;
        if (!content) return;

        const canvas = await html2canvas(content, { scale: 3 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`curriculo_${(resumeData.profile.name || 'Curriculo').replace(' ', '_')}.pdf`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">6. Escolha o Modelo e Finalize</h2>
            <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-slate-300">Selecione um modelo:</p>
                {templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTemplate(t.id as 'modern' | 'classic')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            resumeData.template === t.id ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                    >
                        {t.name}
                    </button>
                ))}
            </div>

            <div className="flex justify-center gap-4 my-4">
                <button onClick={handlePrint} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700">Imprimir</button>
                <button onClick={handleDownloadPdf} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700">Baixar PDF</button>
            </div>

            <div className="bg-white rounded-md p-2 shadow-lg">
                <div ref={resumePreviewRef}>
                    {resumeData.template === 'modern' && <TemplateModern data={resumeData} />}
                    {resumeData.template === 'classic' && <TemplateClassic data={resumeData} />}
                </div>
            </div>
        </div>
    );
};

export default Step6TemplatesAndPreview;
