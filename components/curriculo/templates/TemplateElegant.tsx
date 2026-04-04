
import React from 'react';
import type { ResumeData } from '../../../types';

// Icons for the template
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;

const TemplateElegant: React.FC<{ data: ResumeData }> = ({ data }) => {
    const { profile, summary, experiences, education, courses, informatics, languages, templateColor, fontSize, lineHeight, title } = data;
    const color = templateColor || '#4b5563'; // gray-600
    const lineHeightClasses = { snug: 'leading-snug', relaxed: 'leading-relaxed', loose: 'leading-loose' };

    const formattedAddress = [
        profile.address.street,
        profile.address.number && `nº ${profile.address.number}`,
        profile.address.city && `${profile.address.city} - ${profile.address.state}`
    ].filter(Boolean).join(', ');

    const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
        <div className="text-center my-4">
            <h2 className="text-lg font-bold uppercase tracking-widest" style={{ color }}>{children}</h2>
            <div className="w-16 h-px mx-auto mt-1" style={{backgroundColor: color}}></div>
        </div>
    );
    
    const informaticsSkills = Object.entries(informatics.skills)
        .filter(([, level]) => level !== 'Nenhum')
        .map(([skill, level]) => `${skill.charAt(0).toUpperCase() + skill.slice(1)} (${level})`);

    return (
        <div className={`bg-gray-100 text-gray-800 ${lineHeightClasses[lineHeight || 'relaxed']}`} style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: `${fontSize}px` }}>
            <header className="bg-gray-700 text-white p-8 text-center">
                <h1 className="text-4xl font-bold tracking-widest">{profile.name}</h1>
                {title && <p className="text-xl mt-1 tracking-wider">{title}</p>}
                <div className="flex justify-center items-center gap-6 mt-4 text-sm flex-wrap">
                    {profile.phone && <span className="flex items-center gap-2"><PhoneIcon/> {profile.phone}</span>}
                    {profile.email && <span className="flex items-center gap-2"><MailIcon/> {profile.email}</span>}
                    {formattedAddress && <span className="flex items-center gap-2"><LocationIcon/> {formattedAddress}</span>}
                </div>
            </header>

            <div className="p-8">
                {summary && <section className="mb-6"><p className="text-center italic">{summary}</p></section>}

                {experiences.length > 0 && <section className="mb-6">
                    <SectionTitle>Experiência</SectionTitle>
                    {experiences.map(exp => (
                        <div key={exp.id} className="mb-4 grid grid-cols-[100px_1fr] gap-4">
                            <p className="font-semibold text-gray-600">{exp.period}</p>
                            <div>
                                <h3 className="font-bold text-lg">{exp.company}</h3>
                                <p className="font-semibold">{exp.role}</p>
                                <p className="mt-1 text-gray-700">{exp.description}</p>
                            </div>
                        </div>
                    ))}
                </section>}

                {education.length > 0 && <section className="mb-6">
                    <SectionTitle>Formação</SectionTitle>
                     {education.map(edu => (
                        <div key={edu.id} className="mb-4 grid grid-cols-[100px_1fr] gap-4">
                            <p className="font-semibold text-gray-600">{edu.period}</p>
                            <div>
                                <h3 className="font-bold text-lg">{edu.degree}</h3>
                                <p className="font-semibold">{edu.institution}</p>
                            </div>
                        </div>
                    ))}
                </section>}

                {(languages.length > 0 || courses.length > 0 || informatics.hasInformatics) && <section className="mb-6">
                    <SectionTitle>Habilidades</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                         {languages.map(lang => (
                            <div key={lang.id}>
                                <h4 className="font-bold">{lang.name}</h4>
                                <p className="text-gray-600">{lang.level}</p>
                            </div>
                        ))}
                        {informatics.hasInformatics && informaticsSkills.length > 0 && (
                            <div>
                               <h4 className="font-bold">Informática</h4>
                               <p className="text-gray-600">{informaticsSkills.join(', ')}</p>
                            </div>
                        )}
                         {courses.map(course => (
                            <div key={course.id}>
                                <h4 className="font-bold">{course.name}</h4>
                                <p className="text-gray-600">{course.institution}</p>
                            </div>
                        ))}
                    </div>
                </section>}
            </div>
        </div>
    );
};

export default TemplateElegant;