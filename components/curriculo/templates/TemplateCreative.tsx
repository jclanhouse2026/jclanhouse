
import React from 'react';
import type { ResumeData } from '../../../types';
import { SafeImage } from '../../SafeImage';

// Icons for the template
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;


const TemplateCreative: React.FC<{ data: ResumeData, sidebarPosition?: 'left' | 'right' }> = ({ data, sidebarPosition = 'left' }) => {
    const { profile, summary, experiences, education, courses, informatics, languages, templateColor, fontSize, lineHeight, title, alignment, fontTitle, fontBody } = data;
    const color = templateColor || '#8b5cf6'; // purple-500
    const lineHeightClasses = { snug: 'leading-snug', relaxed: 'leading-relaxed', loose: 'leading-loose' };
    const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right', justify: 'text-justify' };

    const formattedAddress = [
        profile.address.street,
        profile.address.number && `nº ${profile.address.number}`,
        profile.address.neighborhood,
        profile.address.city && `${profile.address.city} - ${profile.address.state}`
    ].filter(Boolean).join(', ');

    const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color, fontFamily: fontTitle || 'Inter' }}>
            {children}
        </h2>
    );

    const SidebarSectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h3 className="font-bold border-b border-white/30 pb-1 mb-2" style={{ fontFamily: fontTitle || 'Inter' }}>{children}</h3>
    );
    
    const informaticsSkills = Object.entries(informatics.skills)
        .filter(([, level]) => level !== 'Nenhum')
        .map(([skill, level]) => `${skill.charAt(0).toUpperCase() + skill.slice(1)} (${level})`);
        
    const hasInformaticsDetails = informatics.hasInformatics && (
        informaticsSkills.length > 0 ||
        informatics.typing !== 'Nenhum' ||
        informatics.maintenance
    );

    const MainContent = () => (
        <>
            {summary && <section><SectionTitle>Resumo Profissional</SectionTitle><p className={alignmentClasses[alignment || 'left']}>{summary}</p></section>}
            {experiences.length > 0 && <section>
                <SectionTitle>Experiência Profissional</SectionTitle>
                <div className="space-y-4">
                    {experiences.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold" style={{ fontFamily: fontTitle || 'Inter' }}>{exp.role}</h3>
                                <p className="text-xs font-medium text-gray-500">{exp.period}</p>
                            </div>
                            <p className="text-sm font-semibold">{exp.company}</p>
                            <p className={`mt-1 text-gray-600 ${alignmentClasses[alignment || 'left']}`}>{exp.description}</p>
                        </div>
                    ))}
                </div>
            </section>}
            {education.length > 0 && <section>
                <SectionTitle>Formação Acadêmica</SectionTitle>
                <div className="space-y-3">
                    {education.map(edu => (
                        <div key={edu.id}>
                            <p className="font-bold" style={{ fontFamily: fontTitle || 'Inter' }}>{edu.degree}</p>
                            <p className="text-sm text-gray-700">{edu.institution}</p>
                            <p className="text-xs text-gray-500">{edu.period}</p>
                        </div>
                    ))}
                </div>
            </section>}
        </>
    );

    const SidebarContent = () => (
         <>
            {profile.photo && (
                <SafeImage src={profile.photo} alt="Profile" className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-white/50" />
            )}
            
            <div className="mb-4">
                <SidebarSectionTitle>Contato</SidebarSectionTitle>
                <ul className="space-y-1 text-sm">
                   {profile.email && <li className="flex items-start gap-2"><MailIcon /> <span>{profile.email}</span></li>}
                   {profile.phone && <li className="flex items-start gap-2"><PhoneIcon /> <span>{profile.phone}</span></li>}
                   {formattedAddress && <li className="flex items-start gap-2"><LocationIcon /> <span>{formattedAddress}</span></li>}
                </ul>
            </div>

            <div className="mb-4">
                <SidebarSectionTitle>Detalhes</SidebarSectionTitle>
                 <ul className="space-y-1 text-sm">
                    {profile.dob && <li><span className="font-semibold">Nascimento:</span> {new Date(profile.dob + 'T00:00:00').toLocaleDateString('pt-BR')}</li>}
                    {profile.birthPlace && <li><span className="font-semibold">Naturalidade:</span> {profile.birthPlace}</li>}
                    {profile.cnh.category !== 'Não possui' && <li><span className="font-semibold">CNH:</span> Cat. {profile.cnh.category} {profile.cnh.ear ? '(EAR)' : ''}</li>}
                </ul>
            </div>

            {languages.length > 0 && <div className="mb-4">
                <SidebarSectionTitle>Idiomas</SidebarSectionTitle>
                <ul className="space-y-1 text-sm">
                    {languages.map(lang => (
                        <li key={lang.id}>{lang.name} - <span className="opacity-80">{lang.level}</span></li>
                    ))}
                </ul>
            </div>}
            
            {(hasInformaticsDetails || courses.length > 0) && <div className="mb-4">
                <SidebarSectionTitle>Qualificações</SidebarSectionTitle>
                {hasInformaticsDetails && (
                    <div className="text-sm mb-2">
                        <p className="font-semibold">Informática:</p>
                        <ul className="list-disc list-inside text-xs opacity-90 pl-2">
                            {informaticsSkills.length > 0 && <li>{informaticsSkills.join(', ')}</li>}
                            {informatics.typing !== 'Nenhum' && <li>Digitação {informatics.typing}</li>}
                            {informatics.maintenance && <li>Manutenção de PC</li>}
                        </ul>
                    </div>
                )}
                {courses.map(course => (
                    <div key={course.id} className="text-sm">
                        <p className="font-semibold">{course.name}</p>
                        <p className="text-xs opacity-80">{course.institution} ({course.conclusionYear})</p>
                    </div>
                ))}
            </div>}
        </>
    );

    return (
        <div className={`text-gray-800 ${lineHeightClasses[lineHeight || 'relaxed']}`} style={{ fontFamily: fontBody || 'Inter', fontSize: `${fontSize}px` }}>
            <div className={`flex ${sidebarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                {/* Sidebar */}
                <div className="w-1/3 p-4 text-white" style={{ backgroundColor: color }}>
                    <SidebarContent/>
                </div>

                {/* Main content */}
                <div className="w-2/3 p-6 space-y-4">
                    <header>
                        <h1 className="text-4xl font-extrabold" style={{ color, fontFamily: fontTitle || 'Inter' }}>{profile.name}</h1>
                        {title && <h2 className="text-lg font-semibold" style={{ fontFamily: fontTitle || 'Inter' }}>{title}</h2>}
                    </header>
                    <MainContent />
                </div>
            </div>
        </div>
    );
};

export default TemplateCreative;