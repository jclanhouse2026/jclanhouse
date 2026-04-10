import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { getLocalData, setLocalData } from '../lib/storage_helper';
import { supabase } from '../lib/supabase';
import type { ResumeData, Experience, Education, Language, Course, InformaticsData, ResumeConfig, Objective, TemplateOption, LineHeightOption, FontSizeOption, ResumeRequest } from '../types';

// --- INÍCIO: Dados de Configuração Padrão ---
const initialObjectives: Objective[] = [
    { id: '1', category: "Primeiro Emprego", text: "Busco minha primeira oportunidade no mercado de trabalho, com disposição para aprender, responsabilidade e comprometimento. Tenho facilidade para trabalhar em equipe ou individualmente, boa comunicação, comprometimento com horários e disposição para aprender e evoluir profissionalmente." },
    { id: '2', category: "Primeiro Emprego", text: "Desejo ingressar no mercado de trabalho pela primeira vez, contribuindo com dedicação, pontualidade e vontade de crescer. Tenho facilidade para trabalhar em equipe ou individualmente, boa comunicação, comprometimento com horários e disposição para aprender e evoluir profissionalmente." },
    { id: '3', category: "Fazenda / Área Rural", text: "Atuar na área rural, auxiliando nas atividades diárias com esforço, responsabilidade e respeito às orientações. Tenho facilidade para trabalhar em equipe ou individualmente, boa comunicação, comprometimento com horários e disposição para aprender e evoluir profissionalmente." },
    { id: '4', category: "Lojas / Comércio / Atendimento", text: "Atuar no comércio ou atendimento ao público, oferecendo um atendimento cordial e eficiente. Tenho facilidade para trabalhar em equipe ou individualmente, boa comunicação, comprometimento com horários e disposição para aprender e evoluir profissionalmente." },
];

const initialTemplates: TemplateOption[] = [
    { id: 'modern', name: 'Moderno' },
    { id: 'classic', name: 'Clássico' },
    { id: 'creative', name: 'Criativo' },
    { id: 'elegant', name: 'Elegante' },
    { id: 'sidebar', name: 'Barra Lateral' },
    { id: 'creative-right', name: 'Criativo Invertido' },
];

const initialColors: string[] = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const initialLineHeights: LineHeightOption[] = [ { id: 'snug', name: 'Pequeno' }, { id: 'relaxed', name: 'Médio' }, { id: 'loose', name: 'Grande' } ];

const initialFontSizes: FontSizeOption[] = [
    { id: 9, name: 'Pequeno' },
    { id: 10.5, name: 'Médio' },
    { id: 12, name: 'Grande' }
];

const initialSectionSpacings = [
    { id: 1, name: 'Pequeno' },
    { id: 1.5, name: 'Médio' },
    { id: 2, name: 'Grande' }
];

const initialResumeConfig: ResumeConfig = {
    templates: initialTemplates,
    colors: initialColors,
    lineHeights: initialLineHeights,
    objectives: initialObjectives,
    fontSizes: initialFontSizes,
    sectionSpacings: initialSectionSpacings,
};
// --- FIM: Dados de Configuração Padrão ---

const initialResumeData: ResumeData = {
  title: 'Modelo de Currículo Preenchido',
  profile: {
    photo: '',
    name: 'Seu Nome Completo',
    dob: '1990-05-15',
    address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' },
    birthPlace: 'Cidade, UF',
    email: 'seu.email@exemplo.com',
    phone: '(XX) XXXXX-XXXX',
    cnh: { category: 'Não possui', ear: false, },
  },
  summary: 'Profissional dedicado com mais de 5 anos de experiência na área administrativa, com forte conhecimento em rotinas de escritório, controle de documentos e atendimento ao cliente. Busco uma oportunidade para aplicar minhas habilidades e contribuir para o crescimento da empresa.',
  experiences: [ { id: '1', role: 'Assistente Administrativo', company: 'Empresa Exemplo Ltda.', period: 'Jan 2018 - Dez 2023', description: 'Responsável pelo gerenciamento de agendas, organização de arquivos, elaboração de relatórios e suporte geral à equipe de gestão.'} ],
  education: [ { id: '1', institution: 'Universidade Federal de Pernambuco', degree: 'Graduação - Completo', period: '2014 - 2017'} ],
  courses: [ { id: '1', name: 'Excel Avançado', institution: 'SENAC', workload: '40 horas', conclusionYear: '2022'} ],
  informatics: { hasInformatics: true, skills: { word: 'Avançado', excel: 'Avançado', powerpoint: 'Básico', access: 'Nenhum' }, typing: 'Avançado', maintenance: false, isRecent: true, institution: 'SENAC', conclusionYear: '2022' },
  languages: [ { id: '1', name: 'Português', level: 'Nativo' } ],
  template: 'modern',
  templateColor: '#06b6d4',
  fontSize: 10.5,
  lineHeight: 'relaxed',
  alignment: 'left',
  fontTitle: 'Inter',
  fontBody: 'Inter',
  sectionSpacing: 1.5,
};

interface ResumeContextType {
  resumeData: ResumeData;
  updateTitle: (value: string) => void;
  updateProfile: (field: keyof ResumeData['profile'], value: string) => void;
  updateAddress: (field: keyof ResumeData['profile']['address'], value: string) => void;
  updateCnh: (field: 'category' | 'ear', value: string | boolean) => void;
  updateSummary: (value: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, field: keyof Experience, value: string) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: keyof Education, value: string) => void;
  removeEducation: (id: string) => void;
  addCourse: () => void;
  updateCourse: (id: string, field: keyof Course, value: string) => void;
  removeCourse: (id: string) => void;
  updateInformatics: (field: keyof InformaticsData | `skills.${keyof InformaticsData['skills']}`, value: any) => void;
  setOrUpdateLanguage: (data: { name: string; level: string }) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, field: keyof Language, value: string) => void;
  removeLanguage: (id: string) => void;
  setTemplate: (template: ResumeData['template']) => void;
  setTemplateColor: (color: string) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: ResumeData['lineHeight']) => void;
  setAlignment: (alignment: ResumeData['alignment']) => void;
  setFontTitle: (font: string) => void;
  setFontBody: (font: string) => void;
  setSectionSpacing: (spacing: number) => void;
  
  resumeConfig: ResumeConfig;
  updateResumeConfig: (newConfig: Partial<ResumeConfig>) => Promise<void>;

  addResumeRequest: (details: { userName: string; userWhatsapp: string }) => Promise<ResumeRequest>;
  updateRequestStatus: (id: string, status: 'pending' | 'authorized') => Promise<void>;
  deleteResumeRequest: (id: string) => Promise<void>;
  getRequestsByUserId: (userId: string) => ResumeRequest[];
  getAllRequests: () => ResumeRequest[];
  getRequestById: (id: string) => ResumeRequest | undefined;
  loadResumeIntoBuilder: (data: ResumeData) => void;
  resetResumeBuilder: () => void;
  importProfileData: (customer: any) => void;

  saveSuggestion: (type: 'role' | 'school' | 'course' | 'company', text: string, state?: string, city?: string) => Promise<void>;
  getSuggestions: (type: 'role' | 'school' | 'course' | 'company', state?: string, city?: string) => Promise<string[]>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [resumeConfig, setResumeConfig] = useState<ResumeConfig>(initialResumeConfig);
  const [resumeRequests, setResumeRequests] = useState<ResumeRequest[]>([]);

  useEffect(() => {
    // Local draft stays in localStorage
    const data = getLocalData<ResumeData>('resumeData', initialResumeData);
    setResumeData(data);
    
    // Load config from Supabase
    const fetchConfig = async () => {
        const { data, error } = await supabase
            .from('settings')
            .select('data')
            .eq('id', 'resume_config')
            .single();
        
        if (data) {
            setResumeConfig(data.data as ResumeConfig);
        } else {
            setResumeConfig(initialResumeConfig);
        }
    };

    fetchConfig();

    // Load requests from Supabase
    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('resume_requests')
            .select('*')
            .order('requestedAt', { ascending: false });
        
        if (data) {
            setResumeRequests(data as ResumeRequest[]);
        }
    };

    fetchRequests();

    // Subscriptions
    const configSubscription = supabase
        .channel('resume_config-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.resume_config' }, (payload) => {
            if (payload.new) {
                setResumeConfig((payload.new as any).data as ResumeConfig);
            }
        })
        .subscribe();

    const requestsSubscription = supabase
        .channel('resume_requests-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'resume_requests' }, (payload) => {
            if (payload.eventType === 'INSERT') {
                setResumeRequests(prev => [payload.new as ResumeRequest, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setResumeRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new as ResumeRequest : r));
            } else if (payload.eventType === 'DELETE') {
                setResumeRequests(prev => prev.filter(r => r.id !== payload.old.id));
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(configSubscription);
        supabase.removeChannel(requestsSubscription);
    };
  }, []);

  useEffect(() => {
    setLocalData('resumeData', resumeData);
  }, [resumeData]);

  const importProfileData = (customer: any) => {
    setResumeData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: customer.fullName || prev.profile.name,
        email: customer.email || prev.profile.email,
        phone: customer.phone || prev.profile.phone,
        dob: customer.dob || prev.profile.dob,
        photo: customer.photoURL || prev.profile.photo,
        address: customer.address ? {
          cep: customer.address.cep || prev.profile.address.cep,
          street: customer.address.street || prev.profile.address.street,
          number: customer.address.number || prev.profile.address.number,
          neighborhood: customer.address.neighborhood || prev.profile.address.neighborhood,
          city: customer.address.city || prev.profile.address.city,
          state: customer.address.state || prev.profile.address.state,
        } : prev.profile.address
      }
    }));
  };

  const addResumeRequest = async (details: { userName: string; userWhatsapp: string; }): Promise<ResumeRequest> => {
    const newRequestData = {
      userId: user?.id || null,
      userName: details.userName,
      userWhatsapp: details.userWhatsapp,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      resumeData: { ...resumeData },
    };

    const { data, error } = await supabase
        .from('resume_requests')
        .insert([newRequestData])
        .select()
        .single();
    
    if (error) throw error;

    if (user) {
      await addNotification(
        user.id,
        'Currículo Enviado!',
        'Sua solicitação de currículo foi enviada com sucesso e será analisada em breve.',
        'success'
      );
    }

    return data as ResumeRequest;
  };

  const updateRequestStatus = async (id: string, status: 'pending' | 'authorized') => {
    const request = resumeRequests.find(r => r.id === id);
    if (request) {
        const { error } = await supabase
            .from('resume_requests')
            .update({ status })
            .eq('id', id);
        
        if (error) throw error;
        
        if (request.userId) {
          let title = 'Atualização do Currículo';
          let message = `O status da sua solicitação de currículo foi alterado para: ${status === 'authorized' ? 'Autorizado' : 'Pendente'}.`;
          let type: 'info' | 'success' = 'info';

          if (status === 'authorized') {
            message = 'Sua solicitação de currículo foi autorizada! Você já pode prosseguir com a finalização.';
            type = 'success';
          }

          await addNotification(request.userId, title, message, type);
        }
    }
  };

  const deleteResumeRequest = async (id: string) => {
    const { error } = await supabase
        .from('resume_requests')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
  };
  
  const getRequestsByUserId = (userId: string) => {
    return resumeRequests.filter(req => req.userId === userId);
  };

  const getAllRequests = () => {
    return resumeRequests;
  };

  const getRequestById = (id: string) => {
    return resumeRequests.find(req => req.id === id);
  };

  const loadResumeIntoBuilder = (data: ResumeData) => {
      setResumeData(data);
  };
  
  const resetResumeBuilder = () => {
    setResumeData(initialResumeData);
  }

  const updateResumeConfig = async (newConfig: Partial<ResumeConfig>) => {
    const fullNewConfig = { ...resumeConfig, ...newConfig };
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({ id: 'resume_config', data: fullNewConfig });
        
        if (error) throw error;
    } catch (e) {
        console.error("Error updating resume config:", e);
    }
  };

  const capitalizeWords = (str: string) => {
    if (!str) return str;
    const lowerWords = ['de', 'da', 'do', 'das', 'dos', 'e'];
    return str.split(' ').map((word, index) => {
      if (word.length === 0) return word;
      const lowerWord = word.toLowerCase();
      if (index !== 0 && lowerWords.includes(lowerWord)) {
        return lowerWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  };

  const updateTitle = (value: string) => setResumeData(prev => ({ ...prev, title: value }));
  const updateProfile = (field: keyof ResumeData['profile'], value: string) => {
    let formattedValue = value;
    if (field === 'name' || field === 'birthPlace') {
      formattedValue = capitalizeWords(value);
    }
    setResumeData(prev => ({ ...prev, profile: { ...prev.profile, [field]: formattedValue } }));
  };
  const updateAddress = (field: keyof ResumeData['profile']['address'], value: string) => {
    let formattedValue = value;
    if (field === 'street' || field === 'neighborhood' || field === 'city') {
      formattedValue = capitalizeWords(value);
    }
    if (field === 'state') {
      formattedValue = value.toUpperCase();
    }
    setResumeData(prev => ({ ...prev, profile: { ...prev.profile, address: { ...prev.profile.address, [field]: formattedValue, }, }, }));
  };
  const updateCnh = (field: 'category' | 'ear', value: string | boolean) => setResumeData(prev => ({ ...prev, profile: { ...prev.profile, cnh: { ...prev.profile.cnh, [field]: value, }, }, }));
  const updateSummary = (value: string) => setResumeData(prev => ({ ...prev, summary: value }));
  const addExperience = () => setResumeData(prev => ({ ...prev, experiences: [...prev.experiences, { id: Date.now().toString(), role: '', company: '', period: '', description: '' }] }));
  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    let formattedValue = value;
    if (field === 'role' || field === 'company') {
      formattedValue = capitalizeWords(value);
    }
    setResumeData(prev => ({ ...prev, experiences: prev.experiences.map(exp => (exp.id === id ? { ...exp, [field]: formattedValue } : exp)), }));
  };
  const removeExperience = (id: string) => setResumeData(prev => ({ ...prev, experiences: prev.experiences.filter(exp => exp.id !== id) }));
  const addEducation = () => setResumeData(prev => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), institution: '', degree: 'Ensino Médio - Completo', period: '' }] }));
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    let formattedValue = value;
    if (field === 'institution' || field === 'degree') {
      formattedValue = capitalizeWords(value);
    }
    setResumeData(prev => ({ ...prev, education: prev.education.map(edu => (edu.id === id ? { ...edu, [field]: formattedValue } : edu)), }));
  };
  const removeEducation = (id: string) => setResumeData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  const addCourse = () => setResumeData(prev => ({ ...prev, courses: [...prev.courses, { id: Date.now().toString(), name: '', institution: '', workload: '', conclusionYear: '' }] }));
  const updateCourse = (id: string, field: keyof Course, value: string) => {
    let formattedValue = value;
    if (field === 'name' || field === 'institution') {
      formattedValue = capitalizeWords(value);
    }
    setResumeData(prev => ({ ...prev, courses: prev.courses.map(c => (c.id === id ? { ...c, [field]: formattedValue } : c)), }));
  };
  const removeCourse = (id: string) => setResumeData(prev => ({ ...prev, courses: prev.courses.filter(c => c.id !== id) }));
  const addLanguage = () => setResumeData(prev => ({ ...prev, languages: [...prev.languages, { id: Date.now().toString(), name: '', level: 'Básico' }] }));
  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    let formattedValue = value;
    if (field === 'name') {
      formattedValue = capitalizeWords(value);
    }
    setResumeData(prev => ({ ...prev, languages: prev.languages.map(lang => (lang.id === id ? { ...lang, [field]: formattedValue } : lang)), }));
  };
  const removeLanguage = (id: string) => setResumeData(prev => ({ ...prev, languages: prev.languages.filter(lang => lang.id !== id) }));
  const setTemplate = (template: ResumeData['template']) => setResumeData(prev => ({ ...prev, template }));
  const setTemplateColor = (color: string) => setResumeData(prev => ({ ...prev, templateColor: color }));
  const setFontSize = (size: number) => setResumeData(prev => ({ ...prev, fontSize: size }));
  const setLineHeight = (height: ResumeData['lineHeight']) => setResumeData(prev => ({ ...prev, lineHeight: height }));
  const setAlignment = (alignment: ResumeData['alignment']) => setResumeData(prev => ({ ...prev, alignment }));
  const setFontTitle = (font: string) => setResumeData(prev => ({ ...prev, fontTitle: font }));
  const setFontBody = (font: string) => setResumeData(prev => ({ ...prev, fontBody: font }));
  const setSectionSpacing = (spacing: number) => setResumeData(prev => ({ ...prev, sectionSpacing: spacing }));

  const saveSuggestion = async (type: 'role' | 'school' | 'course' | 'company', text: string, state?: string, city?: string) => {
    if (!text || text.length < 2) return;
    const formattedText = text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    
    const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('type', type)
        .eq('text', formattedText)
        .eq('state', state || null)
        .eq('city', city || null)
        .single();
    
    if (data) {
        await supabase
            .from('suggestions')
            .update({ count: (data.count || 0) + 1 })
            .eq('id', data.id);
    } else {
        await supabase
            .from('suggestions')
            .insert([{
                type,
                text: formattedText,
                state: state || null,
                city: city || null,
                count: 1,
                createdAt: new Date().toISOString()
            }]);
    }
  };

  const getSuggestions = async (type: 'role' | 'school' | 'course' | 'company', state?: string, city?: string): Promise<string[]> => {
    let query = supabase
        .from('suggestions')
        .select('text')
        .eq('type', type)
        .order('count', { ascending: false })
        .limit(20);
    
    if (state) query = query.eq('state', state);
    if (city) query = query.eq('city', city);

    const { data, error } = await query;
    return (data || []).map(d => d.text);
  };

  const updateInformatics = (field: keyof InformaticsData | `skills.${keyof InformaticsData['skills']}`, value: any) => {
    setResumeData(prev => {
        if (field.startsWith('skills.')) {
            const skillName = field.split('.')[1] as keyof InformaticsData['skills'];
            return { ...prev, informatics: { ...prev.informatics, skills: { ...prev.informatics.skills, [skillName]: value } } };
        }
        return { ...prev, informatics: { ...prev.informatics, [field as keyof InformaticsData]: value } };
    });
  };
  
  const setOrUpdateLanguage = ({ name, level }: { name: string; level: string }) => {
    setResumeData(prev => {
        const existingLang = prev.languages.find(l => l.name.toLowerCase() === name.toLowerCase());
        if (level === 'Nenhum') return existingLang ? { ...prev, languages: prev.languages.filter(l => l.name.toLowerCase() !== name.toLowerCase()) } : prev;
        if (existingLang) return { ...prev, languages: prev.languages.map(l => l.name.toLowerCase() === name.toLowerCase() ? { ...l, level } : l) };
        return { ...prev, languages: [...prev.languages, { id: Date.now().toString(), name, level }] };
    });
  };

  return (
    <ResumeContext.Provider value={{
      resumeData, updateTitle, updateProfile, updateAddress, updateCnh, updateSummary, addExperience, updateExperience,
      removeExperience, addEducation, updateEducation, removeEducation, addCourse, updateCourse, removeCourse,
      updateInformatics, setOrUpdateLanguage, addLanguage, updateLanguage, removeLanguage, setTemplate,
      setTemplateColor, setFontSize, setLineHeight, setAlignment, setFontTitle, setFontBody, setSectionSpacing,
      resumeConfig, updateResumeConfig,
      addResumeRequest, updateRequestStatus, deleteResumeRequest, getRequestsByUserId, getAllRequests, getRequestById,
      loadResumeIntoBuilder, resetResumeBuilder, importProfileData,
      saveSuggestion, getSuggestions
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
