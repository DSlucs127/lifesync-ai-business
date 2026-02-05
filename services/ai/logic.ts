
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "./prompts";

const MODEL_NAME = "gemini-3-flash-preview";

const tools: FunctionDeclaration[] = [
  {
    name: 'addLead',
    description: 'Registra um novo lead no CRM da empresa.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        company: { type: Type.STRING },
        value: { type: Type.NUMBER },
        phone: { type: Type.STRING }
      },
      required: ['name', 'company', 'value']
    }
  },
  {
    name: 'addTransaction',
    description: 'Registra uma nova transação financeira.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        type: { type: Type.STRING, enum: ['income', 'expense'] },
        category: { type: Type.STRING }
      },
      required: ['description', 'amount', 'type', 'category']
    }
  }
];

export const processAIRequest = async (
    prompt: string, 
    mode: 'personal' | 'work',
    history: any[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      ...history,
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: mode === 'work' ? SYSTEM_INSTRUCTIONS.WORK : SYSTEM_INSTRUCTIONS.PERSONAL,
      tools: [{ functionDeclarations: tools }]
    }
  });

  return response;
};
