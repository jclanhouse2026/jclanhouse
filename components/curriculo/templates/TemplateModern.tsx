
import React from 'react';
import type { ResumeData } from '../../../types';
import { SafeImage } from '../../SafeImage';

// Icons for the template
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>;

const TemplateModern: React.FC<{ data: ResumeData, layout?: 'default' | 'single-column' }> = ({ data, layout = 'default' }) => {
    const { profile, summary, experiences, education, courses, informatics, languages, templateColor, fontSize, lineHeight, title, alignment, fontTitle, fontBody, sectionSpacing } = data;
    const color = templateColor || '#06b6d4';
    const lineHeightClasses = { snug: 'leading-snug', relaxed: 'leading-relaxed', loose: 'leading-loose' };
    const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right', justify: 'text-justify' };
    
    const spacingStyle = {
        marginBottom: `${(sectionSpacing || 1.5) * 0.5}rem`,
        marginTop: `${(sectionSpacing || 1.5) * 0.5}rem`
    };

    const formattedAddress = [
        profile.address.street,
        profile.address.number && `nº ${profile.address.number}`,
        profile.address.neighborhood,
        profile.address.city && `${profile.address.city} - ${profile.address.state}`
    ].filter(Boolean).join(', ');

    const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h2 className="font-bold border-b-2 pb-1 mb-2 uppercase tracking-wider" style={{borderColor: color, color: color, fontFamily: fontTitle || 'Inter'}}>
            {children}
        </h2>
    );
    
    const SidebarSectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h3 className="font-bold uppercase tracking-wider text-xs pb-1 mb-2" style={{color, fontFamily: fontTitle || 'Inter'}}>
            {children}
        </h3>
    );

    const ProfileSection = () => (
         <div className="text-center">
            {profile.photo && (
                <SafeImage src={profile.photo} alt="Profile" className="w-24 h-24 rounded-full mx-auto object-cover mb-3" />
            )}
            <h1 className="text-2xl font-bold" style={{ fontFamily: fontTitle || 'Inter' }}>{profile.name}</h1>
            {title && <p className="font-semibold text-sm" style={{color, fontFamily: fontTitle || 'Inter'}}>{title}</p>}
        </div>
    );
    const ContactSection = () => (
        <div>
            <SidebarSectionTitle>Contato</SidebarSectionTitle>
            <div className="text-xs space-y-1">
                {profile.email && <p className="flex items-center gap-1"><MailIcon />{profile.email}</p>}
                {profile.phone && <p className="flex items-center gap-1"><PhoneIcon />{profile.phone}</p>}
                {formattedAddress && <p className="flex items-start gap-1"><LocationIcon />{formattedAddress}</p>}
            </div>
        </div>
    );
    
    const DetailsSection = () => (
        <div>
            <SidebarSectionTitle>Detalhes</SidebarSectionTitle>
            <div className="text-xs space-y-1">
                {profile.dob && <p><span className="font-semibold">Nascimento:</span> {new Date(profile.dob + 'T00:00:00').toLocaleDateString('pt-BR')}</p>}
                {profile.birthPlace && <p><span className="font-semibold">Naturalidade:</span> {profile.birthPlace}</p>}
                {profile.cnh.category !== 'Não possui' && <p><span className="font-semibold">CNH:</span> Categoria {profile.cnh.category} {profile.cnh.ear ? '(EAR)' : ''}</p>}
            </div>
        </div>
    );
    
    const QualificationsSection = () => {
        const informaticsSkills = Object.entries(informatics.skills)
            .filter(([, level]) => level !== 'Nenhum')
            .map(([skill, level]) => `${skill.charAt(0).toUpperCase() + skill.slice(1)} (${level})`);
            
        const hasInformaticsDetails = informatics.hasInformatics && (
            informaticsSkills.length > 0 ||
            informatics.typing !== 'Nenhum' ||
            informatics.maintenance
        );
        
        if (!hasInformaticsDetails && courses.length === 0) return null;

        return (
            <div>
                <SidebarSectionTitle>Qualificações</SidebarSectionTitle>
                <div className="space-y-2 text-xs" style={spacingStyle}>
                    {hasInformaticsDetails && (
                        <div>
                           <p className="font-semibold">Informática:</p>
                           <ul className="list-disc list-inside text-gray-700">
                                {informaticsSkills.length > 0 && <li>{informaticsSkills.join(', ')}</li>}
                                {informatics.typing !== 'Nenhum' && <li>Digitação {informatics.typing}</li>}
                                {informatics.maintenance && <li>Manutenção de Computadores</li>}
                           </ul>
                        </div>
                    )}
                    {courses.map(course => (
                        <div key={course.id}>
                            <p className="font-semibold">{course.name}</p>
                            <p className="text-gray-600">{course.institution} ({course.conclusionYear})</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    const LanguagesSection = () => (
        <>
            {languages.length > 0 && <div>
                <SidebarSectionTitle>Idiomas</SidebarSectionTitle>
                <ul className="space-y-1">
                    {languages.map(lang => (
                        <li key={lang.id} className="text-xs">{lang.name} - <span className="text-gray-600">{lang.level}</span></li>
                    ))}
                </ul>
            </div>}
        </>
    );

    const MainContent = () => (
        <>
             {summary && <section style={spacingStyle}>
                <SectionTitle>Resumo Profissional</SectionTitle>
                <p className={alignmentClasses[alignment || 'left']}>{summary}</p>
            </section>}
            {experiences.length > 0 && <section style={spacingStyle}>
                <SectionTitle>Experiência</SectionTitle>
                {experiences.map(exp => (
                    <div key={exp.id} className="mb-3">
                        <h3 className="font-bold" style={{ fontFamily: fontTitle || 'Inter' }}>{exp.role}</h3>
                        <p className="text-xs text-gray-600 font-semibold">{exp.company} | {exp.period}</p>
                        <p className={`mt-1 text-gray-700 ${alignmentClasses[alignment || 'left']}`}>{exp.description}</p>
                    </div>
                ))}
            </section>}
             {education.length > 0 && <section style={spacingStyle}>
                <SectionTitle>Formação</SectionTitle>
                {education.map(edu => (
                    <div key={edu.id} className="mb-3">
                        <h3 className="font-bold" style={{ fontFamily: fontTitle || 'Inter' }}>{edu.degree}</h3>
                        <p className="text-xs text-gray-600 font-semibold">{edu.institution} | {edu.period}</p>
                    </div>
                ))}
            </section>}
        </>
    );

    if (layout === 'single-column') {
         return (
            <div className={`text-gray-800 p-6 space-y-4 ${lineHeightClasses[lineHeight || 'relaxed']}`} style={{ fontFamily: fontBody || 'Inter', fontSize: `${fontSize}px` }}>
                <ProfileSection />
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <p className="flex items-center gap-1"><MailIcon />{profile.email}</p>
                    <p className="flex items-center gap-1"><PhoneIcon />{profile.phone}</p>
                    <p className="col-span-2 flex items-start gap-1"><LocationIcon />{formattedAddress}</p>
                </div>
                <hr/>
                <MainContent />
                <QualificationsSection />
                <LanguagesSection />
            </div>
        );
    }

    return (
        <div className={`text-gray-800 p-4 ${lineHeightClasses[lineHeight || 'relaxed']}`} style={{ fontFamily: fontBody || 'Inter', fontSize: `${fontSize}px` }}>
            <div className="grid grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="col-span-1 pr-6 border-r border-gray-200 space-y-4">
                    <ProfileSection />
                    <ContactSection />
                    <DetailsSection />
                    <QualificationsSection />
                    <LanguagesSection />
                </div>

                {/* Right Column */}
                <div className="col-span-2 space-y-4">
                   <MainContent />
                </div>
            </div>
        </div>
    );
};

export default TemplateModern;