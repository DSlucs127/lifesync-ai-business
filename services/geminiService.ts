import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Transaction, CalendarEvent, Attachment, Lead } from "../types";

// Modelo recomendado para velocidade e tarefas gerais
const MODEL = 'gemini-3-flash-preview';

let aiInstance: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

const tools: FunctionDeclaration[] = [
  {
    name: 'addTransaction',
    description: 'Registra uma nova transação financeira.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        type: { type: Type.STRING, enum: ['expense', 'income'] },
        category: { type: Type.STRING },
        date: { type: Type.STRING, description: 'ISO date string' }
      },
      required: ['description', 'amount', 'type', 'category', 'date']
    }
  },
  {
    name: 'addEvent',
    description: 'Agenda um novo evento no calendário.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        date: { type: Type.STRING, description: 'ISO date string' },
        durationMinutes: { type: Type.NUMBER },
        type: { type: Type.STRING, description: 'Categoria do evento' },
        description: { type: Type.STRING }
      },
      required: ['title', 'date', 'durationMinutes']
    }
  }
];

export const geminiChat = async (prompt: string, context: 'personal' | 'work', history: any[] = []) => {
  const ai = getAiClient();
  
  const systemInstruction = context === 'work' 
    ? "Você é um Consultor de Vendas Digital. Sua missão é ajudar a converter leads em clientes e gerenciar o CRM. Sugira respostas educadas, profissionais e focadas em fechamento."
    : "Você é o LifeSync Assistant. Sua missão é organizar a vida do usuário. Processe gastos, agende compromissos e dê conselhos de produtividade.";

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: tools }]
    }
  });

  return response;
};

export const sendMessageToGemini = async (
  text: string, 
  attachments: Attachment[], 
  context: { transactions: Transaction[], events: CalendarEvent[] },
  history: any[] = []
) => {
  const ai = getAiClient();

  const parts: any[] = [{ text }];

  attachments.forEach(att => {
    if (att.type === 'image') {
      const base64Data = att.data.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: base64Data
        }
      });
    }
  });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [...history, { role: 'user', parts }],
    config: {
      systemInstruction: "Você é o assistente central LifeSync. Pode analisar recibos, agendar eventos e gerenciar finanças.",
      tools: [{ functionDeclarations: tools }]
    }
  });

  return response;
};

export const analyzeLead = async (lead: Lead) => {
  const ai = getAiClient();
  
  const prompt = `Analise este lead e sugira 3 ações de fechamento. 
  Lead: ${lead.name}, Valor: R$${lead.value}, Status: ${lead.status}.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { 
      systemInstruction: "Você é um especialista em Growth e Vendas B2B.",
      temperature: 0.7
    }
  });

  return response.text;
};

/**
 * Gera uma sugestão de resposta para WhatsApp baseada no contexto do lead.
 */
export const suggestWhatsAppReply = async (leadName: string, lastMessages: string[]) => {
  const ai = getAiClient();
  
  const prompt = `Baseado nas últimas mensagens com o cliente ${leadName}:
  "${lastMessages.join(' | ')}"
  Escreva uma resposta curta, amigável e profissional para o WhatsApp, incentivando o próximo passo.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { systemInstruction: "Responda apenas com o texto da mensagem sugerida." }
  });

  return response.text;
};

/**
 * Gera um briefing diário com base nos eventos do usuário.
 */
export const generateDailyBriefing = async (events: CalendarEvent[]) => {
  const ai = getAiClient();
  
  const today = new Date();
  const todayStr = today.toDateString();
  const todaysEvents = events.filter(e => new Date(e.date).toDateString() === todayStr);

  if (todaysEvents.length === 0) {
    return "Você não tem eventos agendados para hoje. Aproveite para organizar suas tarefas!";
  }

  const eventsList = todaysEvents.map(e => 
    `- ${e.title} às ${new Date(e.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} (${e.durationMinutes} min)`
  ).join('\n');

  const prompt = `Gere um briefing matinal curto, direto e motivador para o usuário com base nestes eventos de hoje (${today.toLocaleDateString('pt-BR')}):\n${eventsList}\nFale em português do Brasil. Resuma em no máximo 2 frases.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: "Você é um assistente pessoal útil e motivador.",
    }
  });

  return response.text;
};
