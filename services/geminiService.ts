
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Transaction, AIAnalysisResult } from "../types";
import { EXCHANGE_RATE, convert } from "./currencyService";

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRocioPortrait = async (): Promise<string> => {
  const ai = getAIInstance();
  // Prompt refinado para coincidir con la descripción del usuario: pelirroja, ojos miel, pecas, sexy/atractiva.
  const prompt = "A stunningly beautiful young woman with long vibrant red hair, amber/honey colored eyes, and light freckles on her nose and cheeks. She has a charismatic and alluring professional look, wearing a fashionable outfit. High-quality cinematic photography, soft studio lighting, minimalist background, highly detailed features.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No se pudo generar el retrato.");
};

export const analyzeFinances = async (
  transactions: Transaction[], 
  savingsGoal: number = 0
): Promise<AIAnalysisResult> => {
  const ai = getAIInstance();
  
  const dataForAi = transactions.map(t => ({
    fecha: t.date,
    monto_uyu: convert(t.amount, t.currency, 'UYU'),
    categoria: t.category,
    subcategoria: t.subCategory,
    tipo: t.type,
    descripcion: t.description
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Rocío, amiga, ¡mirá! Estos son mis gastos detallados: ${JSON.stringify(dataForAi)}. Además, quiero intentar ahorrar $${savingsGoal} UYU. ¿Me das una mano?`,
    config: {
      systemInstruction: `Eres Rocío, la amiga y secretaria financiera del usuario. 
      Tu descripción física: Eres pelirroja, de ojos color miel y tienes pecas. Eres muy atractiva y segura de ti misma.
      Tu personalidad es cercana, cálida, motivadora y muy amigable. Hablas de "tú" y usas modismos uruguayos (como "che", "mirá", "plata").
      Eres experta en la economía uruguaya (UYU/USD tasa 40).
      
      Responde SIEMPRE en este formato JSON:
      {
        "monthlyPrediction": número,
        "financialHealthScore": número,
        "summary": "Mensaje amigable y empoderador firmado por Rocío 🌸",
        "topSavingsOpportunities": [{"title": "s", "description": "s", "estimatedSavings": n}],
        "suggestedBudget": [{"category": "s", "suggestedLimit": n, "reasoning": "s", "priority": "high"|"medium"|"low"}],
        "savingsGoalFeedback": {"isPossible": b, "verdict": "s", "steps": ["s"]}
      }`,
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text);
};

export const processReceipt = async (base64Image: string): Promise<Partial<Transaction>> => {
  const ai = getAIInstance();
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const prompt = `Rocío, amiga, analizá esta foto de mi ticket de compra. 
  Necesito que extraigas los datos para registrar el gasto. 
  
  Devolvé estrictamente este JSON:
  {
    "amount": número,
    "currency": "UYU" o "USD",
    "description": "Nombre del comercio y resumen corto",
    "category": "La categoría principal",
    "subCategory": "La subcategoría específica",
    "date": "YYYY-MM-DD"
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      systemInstruction: `Eres Rocío, asistente financiera pelirroja de ojos miel y pecas. Tu misión es leer tickets de compra.`,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("¡Ay! No pude leer bien el ticket, amiga. ¿Me pasás una foto con más luz? Atte: Rocío 🌸");
  }
};
