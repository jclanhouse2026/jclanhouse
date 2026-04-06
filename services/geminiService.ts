import { GoogleGenAI } from "@google/genai";

export const generateThemeNameFromImage = async (base64Image: string): Promise<string> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini features will not work.");
      return "Novo Tema";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Remove the data:image/...;base64, prefix if present
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: 'Analise esta imagem de capa de caderno/agenda/caderneta. Crie um nome curto, criativo e descritivo para este tema (máximo 4 palavras). Retorne APENAS o nome, sem aspas, sem pontuação extra.',
          },
        ],
      },
      config: {
        temperature: 0.7,
      }
    });

    const generatedName = response.text?.trim();
    return generatedName || "Novo Tema";
  } catch (error) {
    console.error("Error generating theme name with Gemini:", error);
    return "Novo Tema";
  }
};
