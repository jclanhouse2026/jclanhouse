
import React from 'react';
import type { ResumeData } from '../../../types';

const TemplateClassic: React.FC<{ data: ResumeData, fontFamily?: string }> = ({ data, fontFamily }) => {
    const { profile, summary, experiences, education, courses, informatics, languages, templateColor, fontSize, lineHeight, alignment, fontTitle, fontBody, sectionSpacing } = data;
    const color = templateColor || '#334155'; // slate-700
    const lineHeightClasses = { snug: 'leading-snug', relaxed: 'leading-relaxed', loose: 'leading-loose' };
    const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right', justify: 'text-justify' };
    
    const spacingStyle = {
        marginBottom: `${(sectionSpacing || 1.5) * 0.5}rem`,
        marginTop: `${(sectionSpacing || 1.5) * 0.5}rem`
    };

    const formattedAddress = [
        profile.address.street,
        profile.address.number && `nº ${profile.address.number}`,
        profile.address.city && `${profile.address.city} - ${profile.address.state}`
    ].filter(Boolean).join(', ');

    const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h2 className="text-sm font-bold uppercase tracking-widest border-b mb-2 pb-1" style={{ borderColor: color, color, fontFamily: fontTitle || 'Georgia, serif' }}>
            {children}
        </h2>
    );

    return (
        <div className={`text-gray-900 p-6 ${lineHeightClasses[lineHeight || 'relaxed']}`} style={{ fontFamily: fontBody || fontFamily || 'Georgia, serif', fontSize: `${fontSize}px` }}>
            <header className="text-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold tracking-wider" style={{color, fontFamily: fontTitle || 'Georgia, serif'}}>{profile.name}</h1>
                 <p className="text-xs mt-2 space-x-2">
                    {profile.dob && <span>Nasc: {new Date(profile.dob + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                    {profile.birthPlace && <span>| {profile.birthPlace}</span>}
                    {profile.cnh.category !== 'Não possui' && <span>| CNH: {profile.cnh.category} {profile.cnh.ear ? '(EAR)' : ''}</span>}
                </p>
                <p className="text-sm mt-1">
                    {[formattedAddress, profile.phone, profile.email].filter(Boolean).join(' | ')}
                </p>
            </header>

            {summary && <section style={spacingStyle}>
                <SectionTitle>Resumo</SectionTitle>
                <p className={alignmentClasses[alignment || 'left']}>{summary}</p>
            </section>}
            
            {experiences.length > 0 && <section style={spacingStyle}>
                <SectionTitle>Experiência Profissional</SectionTitle>
                {experiences.map(exp => (
                    <div key={exp.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold" style={{ fontFamily: fontTitle || 'Georgia, serif' }}>{exp.company}</h3>
                            <p className="text-xs italic">{exp.period}</p>
                        </div>
                        <p className="italic text-sm">{exp.role}</p>
                        <p className={`mt-1 text-xs ${alignmentClasses[alignment || 'left']}`}>{exp.description}</p>
                    </div>
                ))}
            </section>}
            
            {education.length > 0 && <section style={spacingStyle}>
                <SectionTitle>Formação</SectionTitle>
                {education.map(edu => (
                    <div key={edu.id} className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold" style={{ fontFamily: fontTitle || 'Georgia, serif' }}>{edu.institution}</h3>
                             <p className="text-xs italic">{edu.period}</p>
                        </div>
                        <p className="italic text-sm">{edu.degree}</p>
                    </div>
                ))}
            </section>}

            {(informatics.hasInformatics || courses.length > 0) && <section style={spacingStyle}>
                <SectionTitle>Qualificações e Cursos</SectionTitle>
                {informatics.hasInformatics && (
                    <div className="mb-2 text-sm">
                        <span className="font-bold">Informática: </span>
                        {Object.entries(informatics.skills).filter(([,level]) => level !== 'Nenhum').map(([skill, level]) => `${skill.charAt(0).toUpperCase()+skill.slice(1)} ${level}`).join(' • ')}
                        {informatics.typing !== 'Nenhum' && ` • Digitação ${informatics.typing}`}
                        {informatics.maintenance && ` • Manutenção de Computadores`}
                    </div>
                )}
                {courses.map(course => (
                    <div key={course.id} className="text-sm">
                       <span className="font-bold">{course.name}</span> - {course.institution} ({course.conclusionYear})
                    </div>
                ))}
            </section>}

            {languages.length > 0 && <section style={spacingStyle}>
                <SectionTitle>Idiomas</SectionTitle>
                 <p>{languages.map(lang => `${lang.name} (${lang.level})`).join(' • ')}</p>
            </section>}
        </div>
    );
};

export default TemplateClassic;