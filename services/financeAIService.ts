import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { Transaction, Category, Budget } from "../types";
import { retryOperation } from "./aiUtils";

const MODEL_NAME = "gemini-3-flash-preview";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const setBudgetTool: FunctionDeclaration = {
  name: 'setBudget',
  description: 'Define meta de gastos.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      categoryName: { type: Type.STRING },
      limitAmount: { type: Type.NUMBER }
    },
    required: ['categoryName', 'limitAmount']
  }
};

const createCategoryTool: FunctionDeclaration = {
  name: 'createCategory',
  description: 'Cria categoria.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING }
    },
    required: ['name']
  }
};

export interface AdvisorContext {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  userProfile: {
      income: number;
      goal: string;
      housingType: string;
      housingCost: number;
      vehicleStatus: string;
      vehicleCost: number;
  };
  mode: 'standard' | 'custom';
}

export const consultFinancialAdvisor = async (
  userMessage: string,
  context: AdvisorContext,
  history: any[] = []
): Promise<GenerateContentResponse | null> => {
  const client = getAIClient();
  if (!client) return null;

  const fixedCosts = context.userProfile.housingCost + context.userProfile.vehicleCost;
  const disposable = context.userProfile.income - fixedCosts;

  // Contexto minimizado para economizar tokens
  const systemContext = `
Consultor LifeSync.
Perfil: Renda=${context.userProfile.income}, Fixos=${fixedCosts}, Livre=${disposable}. Meta=${context.userProfile.goal}.
Modo: ${context.mode}.
Regras:
1. ${context.mode === 'standard' ? 'Seja direto e matemático.' : 'Seja consultivo.'}
2. Use tools para aplicar mudanças.
3. Seja conciso.
`;

  try {
    const response = await retryOperation(() => client.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemContext,
        tools: [{ functionDeclarations: [setBudgetTool, createCategoryTool] }],
        maxOutputTokens: 500
      }
    }));

    return response;
  } catch (error) {
    console.error("Finance AI Error:", error);
    return null;
  }
};