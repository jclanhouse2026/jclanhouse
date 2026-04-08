import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import type { ResumeData, Experience, Education, Language, Course, InformaticsData, ResumeConfig, Objective, TemplateOption, LineHeightOption, FontSizeOption, ResumeRequest } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

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

const initialResumeConfig: ResumeConfig = {
    templates: initialTemplates,
    colors: initialColors,
    lineHeights: initialLineHeights,
    objectives: initialObjectives,
    fontSizes: initialFontSizes,
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

  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [resumeConfig, setResumeConfig] = useState<ResumeConfig>(initialResumeConfig);
  const [resumeRequests, setResumeRequests] = useState<ResumeRequest[]>([]);

  useEffect(() => {
    if (user) {
      const fetchUserResume = async () => {
        try {
          const docRef = doc(db, 'user_resumes', user.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setResumeData(docSnap.data() as ResumeData);
          } else {
            // Try to load from local storage as a fallback for first-time login
            const localData = localStorage.getItem('resumeData');
            if (localData) {
              setResumeData(JSON.parse(localData));
            }
          }
        } catch (error) {
          console.error("Error fetching user resume:", error);
        }
      };
      fetchUserResume();
    } else {
      try {
        const localData = localStorage.getItem('resumeData');
        if (localData) setResumeData(JSON.parse(localData));
      } catch (error) {
        console.error("Could not parse resume data from localStorage", error);
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    if (user) {
      const saveUserResume = async () => {
        try {
          await setDoc(doc(db, 'user_resumes', user.id), resumeData);
        } catch (error) {
          console.error("Error saving user resume:", error);
        }
      };
      // Debounce saving to Firestore to avoid too many writes
      const timeoutId = setTimeout(saveUserResume, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, user]);

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

  // Fetch resume config from Firestore
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'resume_config', 'default');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().config) {
          setResumeConfig(docSnap.data().config);
        }
      } catch (error) {
        console.error("Error fetching resume config, using fallback:", (error as Error).message);
        setResumeConfig(initialResumeConfig);
      }
    };
    fetchConfig();
  }, []);


  useEffect(() => {
    if (!user) {
        setResumeRequests([]);
        return;
    }

    const requestsRef = collection(db, 'resume_requests');
    const q = user.role === 'admin'
        ? query(requestsRef)
        : query(requestsRef, where('user_id', '==', user.id));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const formattedData: ResumeRequest[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            userId: doc.data().user_id,
            userName: doc.data().user_name,
            userWhatsapp: doc.data().user_whatsapp,
            status: doc.data().status,
            requestedAt: doc.data().requested_at,
            resumeData: doc.data().resume_data,
        }));
        setResumeRequests(formattedData);
    }, (error) => {
        try {
            handleFirestoreError(error, OperationType.LIST, 'resume_requests');
        } catch (e) {
            console.error("Erro ao buscar solicitações de currículo:", (e as Error).message);
            setResumeRequests([]);
        }
    });

    return () => unsubscribe();
  }, [user]);


  const addResumeRequest = async (details: { userName: string; userWhatsapp: string; }): Promise<ResumeRequest> => {
    const requestPayload = {
      user_name: details.userName,
      user_whatsapp: details.userWhatsapp,
      resume_data: { ...resumeData },
      user_id: user?.id || null,
      status: 'pending',
      requested_at: new Date().toISOString(),
    };

    try {
        const docRef = await addDoc(collection(db, 'resume_requests'), requestPayload);
        
        const newRequest: ResumeRequest = {
            id: docRef.id,
            userId: requestPayload.user_id,
            userName: requestPayload.user_name,
            userWhatsapp: requestPayload.user_whatsapp,
            status: requestPayload.status as any,
            requestedAt: requestPayload.requested_at,
            resumeData: requestPayload.resume_data,
        };
        // setResumeRequests(prev => [newRequest, ...prev]); // onSnapshot cuidará disso
        return newRequest;
    } catch (error) {
        return handleFirestoreError(error, OperationType.CREATE, 'resume_requests');
    }
  };

  const updateRequestStatus = async (id: string, status: 'pending' | 'authorized') => {
    try {
        await updateDoc(doc(db, 'resume_requests', id), { status });
        // setResumeRequests(prev => prev.map(req => (req.id === id ? { ...req, status } : req))); // onSnapshot cuidará disso
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `resume_requests/${id}`);
    }
  };

  const deleteResumeRequest = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'resume_requests', id));
        // setResumeRequests(prev => prev.filter(req => req.id !== id)); // onSnapshot cuidará disso
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `resume_requests/${id}`);
    }
  };
  
  const getRequestsByUserId = (userId: string) => {
    return resumeRequests.filter(req => req.userId === userId).sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  };

  const getAllRequests = () => {
    return [...resumeRequests].sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  };

  const getRequestById = (id: string) => {
    return resumeRequests.find(req => req.id === id);
  };

  const loadResumeIntoBuilder = (data: ResumeData) => {
      setResumeData(data);
  };
  
  const resetResumeBuilder = () => {
    localStorage.removeItem('resumeData');
    setResumeData(initialResumeData);
  }

  const updateResumeConfig = async (newConfig: Partial<ResumeConfig>) => {
    const fullNewConfig = { ...resumeConfig, ...newConfig };
    setResumeConfig(fullNewConfig); // Update state locally for immediate feedback
    try {
        await setDoc(doc(db, 'resume_config', 'default'), { config: fullNewConfig }, { merge: true });
    } catch (error) {
        console.error("Failed to save resume config to DB:", (error as Error).message);
        // Optionally revert state or show an error to the user
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

  const saveSuggestion = async (type: 'role' | 'school' | 'course' | 'company', text: string, state?: string, city?: string) => {
    if (!text || text.length < 2) return;
    
    // Capitalize first letter of each word
    const formattedText = text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    try {
      const suggestionsRef = collection(db, 'suggestions');
      let q = query(suggestionsRef, where('type', '==', type), where('text', '==', formattedText));
      
      if (state) q = query(q, where('state', '==', state));
      if (city) q = query(q, where('city', '==', city));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(suggestionsRef, {
          type,
          text: formattedText,
          state: state || null,
          city: city || null,
          count: 1,
          createdAt: new Date().toISOString()
        });
      } else {
        const docRef = doc(db, 'suggestions', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          count: (querySnapshot.docs[0].data().count || 0) + 1
        });
      }
    } catch (error) {
      console.error("Error saving suggestion:", error);
    }
  };

  const getSuggestions = async (type: 'role' | 'school' | 'course' | 'company', state?: string, city?: string): Promise<string[]> => {
    try {
      const suggestionsRef = collection(db, 'suggestions');
      let q = query(suggestionsRef, where('type', '==', type));
      
      if (state) q = query(q, where('state', '==', state));
      if (city) q = query(q, where('city', '==', city));

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => doc.data().text as string);
      
      // Remove duplicates and return top 10 (or similar)
      return Array.from(new Set(results)).slice(0, 20);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return [];
    }
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
      setTemplateColor, setFontSize, setLineHeight, setAlignment, setFontTitle, setFontBody,
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
