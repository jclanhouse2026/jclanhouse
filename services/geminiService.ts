const getApiKey = () => import.meta.env.VITE_AI_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const getApiUrl = (model = 'gemini-1.5-flash') => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://generativelanguage.googleapis.com/v1/models';
  return `${baseUrl}/${model}:generateContent?key=${getApiKey()}`;
};

/**
 * Função global e reutilizável para gerar texto com IA
 */
export const gerarTextoIA = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("VITE_AI_KEY não configurada.");
    return "Erro: Chave de API não configurada.";
  }

  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        systemInstruction: systemInstruction ? {
          parts: [{ text: systemInstruction }]
        } : undefined,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Falha na comunicação com a IA');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Erro na chamada da IA:", error);
    throw error;
  }
};

export const generateThemeNameFromImage = async (base64Image: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Novo Tema";

  try {
    const base64Data = (base64Image || '').split(',')[1] || base64Image;
    const mimeType = (base64Image || '').split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: 'Analise esta imagem de capa de caderno/agenda/caderneta. Crie um nome curto, criativo e descritivo para este tema (máximo 4 palavras). Retorne APENAS o nome, sem aspas, sem pontuação extra.' }
          ]
        }]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Novo Tema";
  } catch (error) {
    console.error("Error generating theme name:", error);
    return "Novo Tema";
  }
};

export const generateMugThemeInfoFromImage = async (base64Image: string): Promise<{ name: string, category: string }> => {
  const apiKey = getApiKey();
  if (!apiKey) return { name: "Novo Tema", category: "Geral" };

  try {
    const base64Data = (base64Image || '').split(',')[1] || base64Image;
    const mimeType = (base64Image || '').split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: 'Analise esta imagem de estampa para caneca. Identifique o tema e sugira um nome curto e uma categoria (ex: Dia das Mães, Dia dos Pais, Infantil, Geek, Profissões, etc). Retorne APENAS um objeto JSON no formato: {"name": "Nome do Tema", "category": "Nome da Categoria"}. Sem aspas extras, sem blocos de código markdown.' }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{"name": "Novo Tema", "category": "Geral"}';
    
    try {
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      return { name: "Novo Tema", category: "Geral" };
    }
  } catch (error) {
    console.error("Error generating mug theme info:", error);
    return { name: "Novo Tema", category: "Geral" };
  }
};

export const generateResumeSummary = async (resumeData: any, isFirstJob: boolean = false): Promise<string> => {
  const experiencesStr = resumeData.experiences.map((exp: any) => `${exp.role} na ${exp.company} (${exp.period}): ${exp.description}`).join('; ');
  const educationStr = resumeData.education.map((edu: any) => `${edu.degree} na ${edu.institution} (${edu.period})`).join('; ');
  const coursesStr = resumeData.courses.map((c: any) => `${c.name} na ${c.institution}`).join('; ');
  const informaticsStr = resumeData.informatics.hasInformatics 
      ? `Habilidades em informática: Word (${resumeData.informatics.skills.word}), Excel (${resumeData.informatics.skills.excel}), PowerPoint (${resumeData.informatics.skills.powerpoint}).` 
      : '';
  const languagesStr = resumeData.languages.map((l: any) => `${l.name} (${l.level})`).join(', ');

  let prompt = `Escreva um resumo profissional curto e impactante (máximo 400 caracteres) para um currículo.
  Nome: ${resumeData.profile.name}
  Educação: ${educationStr}
  Experiências: ${experiencesStr}
  Cursos: ${coursesStr}
  ${informaticsStr}
  Idiomas: ${languagesStr}
  `;

  if (isFirstJob) {
      prompt = `Escreva um resumo profissional para alguém que busca o PRIMEIRO EMPREGO. Destaque a vontade de aprender, responsabilidade e as formações acadêmicas.
      Nome: ${resumeData.profile.name}
      Educação: ${educationStr}
      Cursos: ${coursesStr}
      ${informaticsStr}
      Idiomas: ${languagesStr}
      `;
  }

  return await gerarTextoIA(prompt, "Você é um especialista em RH e recrutamento. Escreva resumos profissionais em português do Brasil que sejam formais, diretos e atraentes para recrutadores. Não use aspas no início ou fim do texto.");
};

export const correctText = async (text: string): Promise<string> => {
  if (!text || text.length < 5) return text;
  try {
    return await gerarTextoIA(`Corrija a gramática e ortografia do seguinte texto, mantendo o sentido original e o tom profissional: "${text}". Retorne apenas o texto corrigido, sem aspas.`);
  } catch (error) {
    return text;
  }
};

export const generateResumeObjective = async (role: string, experience: string): Promise<string> => {
  return await gerarTextoIA(`Gere um objetivo profissional curto e impactante para um currículo. Cargo desejado: ${role}. Experiência/Habilidades: ${experience}. Retorne apenas o texto do objetivo, em português, com no máximo 3 frases.`);
};

export const getAISuggestion = async (context: string, currentData: string): Promise<string> => {
  return await gerarTextoIA(`Você é um assistente inteligente de uma Lan House e Gráfica Rápida. Contexto: ${context}. Dados atuais: ${currentData}. Sugira uma melhoria ou complete a informação de forma profissional e amigável. Retorne apenas a sugestão curta.`);
};

