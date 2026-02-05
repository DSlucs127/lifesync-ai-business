import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StudyPlan, StudyNode, QuizQuestion } from "../types";
import { retryOperation } from "./aiUtils";

const MODEL_NAME = "gemini-3-flash-preview";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateStudyCurriculum = async (topic: string): Promise<Omit<StudyPlan, 'id' | 'userId' | 'createdAt'> | null> => {
  const client = getAIClient();
  if (!client) return null;

  const prompt = `Crie plano de estudos JSON sobre "${topic}". 8-12 módulos. Sem intro/fim.`;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            theme: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  position: { type: Type.INTEGER }
                },
                required: ["id", "title", "description", "position"]
              }
            }
          },
          required: ["title", "description", "theme", "nodes"]
        }
      }
    }));

    if (response.text) {
        const data = JSON.parse(response.text);
        data.nodes = data.nodes.map((n: any, idx: number) => ({
            ...n,
            status: idx === 0 ? 'unlocked' : 'locked',
            content: ''
        }));
        return data;
    }
    return null;
  } catch (error) {
    console.error("Study Error:", error);
    return null;
  }
};

export const generateLessonContent = async (topic: string, nodeTitle: string): Promise<string> => {
    const client = getAIClient();
    if (!client) return "";

    try {
        const response = await retryOperation<GenerateContentResponse>(() => client.models.generateContent({
            model: MODEL_NAME,
            contents: `Aula: "${nodeTitle}" (${topic}). Use bullet points. Max 150 palavras. Direto ao ponto.`,
            config: { maxOutputTokens: 300 }
        }));
        return response.text || "";
    } catch (e) {
        return "Erro ao gerar conteúdo.";
    }
};

export const generateQuiz = async (topic: string, nodeTitle: string): Promise<QuizQuestion[]> => {
    const client = getAIClient();
    if (!client) return [];

    const prompt = `5 questões múltipla escolha JSON sobre "${nodeTitle}" (${topic}). Dificil.`;

    try {
        const response = await retryOperation<GenerateContentResponse>(() => client.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswerIndex", "explanation"]
                    }
                }
            }
        }));

        if (response.text) return JSON.parse(response.text);
        return [];
    } catch (e) {
        return [];
    }
};