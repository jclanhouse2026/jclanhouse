
import React from 'react';
import type { ResumeData } from '../../../types';

const TemplateSidebar: React.FC<{ data: ResumeData }> = ({ data }) => {
    const { profile, summary, experiences, education, courses, informatics, languages, templateColor, fontSize, lineHeight, title } = data;
    const color = templateColor || '#2563eb'; // blue-600
    const lineHeightClasses = { snug: 'leading-snug', relaxed: 'leading-relaxed', loose: 'leading-loose' };

    const formattedAddress = [
        profile.address.street,
        profile.address.number && `nº ${profile.address.number}`,
        profile.address.neighborhood,
        profile.address.city && `${profile.address.city} - ${profile.address.state}, ${profile.address.cep}`
    ].filter(Boolean).join(', ');
    
    const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h3 className="font-bold uppercase tracking-wider text-sm mb-2" style={{ color }}>
            {children}
        </h3>
    );
    
    const informaticsSkills = Object.entries(informatics.skills)
        .filter(([, level]) => level !== 'Nenhum')
        .map(([skill, level]) => `${skill.charAt(0).toUpperCase() + skill.slice(1)}`);
        
    const hasInformaticsDetails = informatics.hasInformatics && informaticsSkills.length > 0;

    return (
        <div className={`bg-white text-gray-800 flex ${lineHeightClasses[lineHeight || 'relaxed']}`} style={{ fontFamily: 'sans-serif', fontSize: `${fontSize}px` }}>
            {/* Main Content */}
            <div className="w-2/3 p-8">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold" style={{ color }}>{profile.name}</h1>
                    {title && <h2 className="text-lg font-semibold text-gray-700">{title}</h2>}
                </header>

                {summary && <section className="mb-6">
                    <SectionTitle>Perfil</SectionTitle>
                    <p className="text-gray-600">{summary}</p>
                </section>}

                {experiences.length > 0 && <section className="mb-6">
                    <SectionTitle>Experiência Profissional</SectionTitle>
                    <div className="space-y-4">
                        {experiences.map(exp => (
                            <div key={exp.id}>
                                <h4 className="font-bold text-lg">{exp.role}</h4>
                                <p className="font-semibold text-gray-700">{exp.company} | {exp.period}</p>
                                <ul className="list-disc list-inside text-gray-600 text-sm mt-1">
                                    {exp.description.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>}
                
                {education.length > 0 && <section>
                    <SectionTitle>Formação Acadêmica</SectionTitle>
                     <div className="space-y-4">
                        {education.map(edu => (
                            <div key={edu.id}>
                                <h4 className="font-bold text-lg">{edu.degree}</h4>
                                <p className="font-semibold text-gray-700">{edu.institution} | {edu.period}</p>
                            </div>
                        ))}
                    </div>
                </section>}

            </div>

            {/* Sidebar */}
            <aside className="w-1/3 bg-gray-100 p-6">
                 {profile.photo && (
                    <img src={profile.photo} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-6 object-cover" />
                )}

                <section className="mb-6">
                    <SectionTitle>Contato</SectionTitle>
                    <div className="text-sm space-y-1 text-gray-600">
                        {profile.email && <p><span className="font-semibold">Email:</span> {profile.email}</p>}
                        {profile.phone && <p><span className="font-semibold">Telefone:</span> {profile.phone}</p>}
                        {formattedAddress && <p><span className="font-semibold">Endereço:</span> {formattedAddress}</p>}
                    </div>
                </section>
                
                {(hasInformaticsDetails || courses.length > 0 || languages.length > 0) && <section className="mb-6">
                    <SectionTitle>Habilidades</SectionTitle>
                    <ul className="text-sm space-y-1 text-gray-600 list-disc list-inside">
                        {hasInformaticsDetails && informaticsSkills.map(skill => <li key={skill}>{skill}</li>)}
                        {courses.map(course => <li key={course.id}>{course.name}</li>)}
                        {languages.map(lang => <li key={lang.id}>{lang.name} ({lang.level})</li>)}
                    </ul>
                </section>}

                {(profile.cnh.category !== 'Não possui' || profile.dob) && <section>
                    <SectionTitle>Detalhes Pessoais</SectionTitle>
                     <div className="text-sm space-y-1 text-gray-600">
                        {profile.dob && <p><span className="font-semibold">Nascimento:</span> {new Date(profile.dob + 'T00:00:00').toLocaleDateString('pt-BR')}</p>}
                        {profile.cnh.category !== 'Não possui' && <p><span className="font-semibold">CNH:</span> Cat. {profile.cnh.category} {profile.cnh.ear ? '(EAR)' : ''}</p>}
                     </div>
                </section>}

            </aside>
        </div>
    );
};

export default TemplateSidebar;