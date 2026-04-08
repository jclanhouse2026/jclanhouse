import Groq from "groq-sdk";

let customApiKey = '';

export const setCustomApiKey = (key: string) => {
  customApiKey = key;
};

const getAiClient = () => {
  const apiKey = customApiKey || 
                 import.meta.env.VITE_GROQ_API_KEY || 
                 import.meta.env.VITE_AI_KEY || 
                 process.env.GROQ_API_KEY;
                 
  if (!apiKey) {
    throw new Error("Chave de API do Groq não encontrada. Verifique as configurações do projeto.");
  }
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
};

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Função global e reutilizável para gerar texto com IA usando Groq
 */
export const gerarTextoIA = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const groq = getAiClient();
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemInstruction || "Você é um assistente prestativo." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Erro na chamada da IA (Groq):", error);
    throw error;
  }
};

export const generateThemeNameFromImage = async (base64Image: string): Promise<string> => {
  // Groq doesn't support vision in all models yet, or requires specific models.
  // For now, we'll return a generic name or use a text-based fallback if possible.
  // Since the original used Gemini Vision, and Groq's vision models are different (e.g. llama-3.2-11b-vision-preview)
  try {
    const groq = getAiClient();
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta imagem de capa de caderno/agenda/caderneta. Crie um nome curto, criativo e descritivo para este tema (máximo 4 palavras). Retorne APENAS o nome, sem aspas, sem pontuação extra." },
            {
              type: "image_url",
              image_url: {
                url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || "Novo Tema";
  } catch (error) {
    console.error("Error generating theme name with Groq Vision:", error);
    return "Novo Tema";
  }
};

export const generateMugThemeInfoFromImage = async (base64Image: string): Promise<{ name: string, category: string }> => {
  try {
    const groq = getAiClient();
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: 'Analise esta imagem de estampa para caneca. Identifique o tema e sugira um nome curto e uma categoria (ex: Dia das Mães, Dia dos Pais, Infantil, Geek, Profissões, etc). Retorne APENAS um objeto JSON no formato: {"name": "Nome do Tema", "category": "Nome da Categoria"}. Sem aspas extras, sem blocos de código markdown.' },
            {
              type: "image_url",
              image_url: {
                url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content?.trim() || '{"name": "Novo Tema", "category": "Geral"}';
    
    try {
      return JSON.parse(text);
    } catch (e) {
      return { name: "Novo Tema", category: "Geral" };
    }
  } catch (error) {
    console.error("Error generating mug theme info with Groq Vision:", error);
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

