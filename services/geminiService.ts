import { Transaction, CalendarEvent, Attachment, Lead } from "../types";

// Helper for API calls
const apiCall = async (endpoint: string, body: any) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

export const geminiChat = async (prompt: string, context: 'personal' | 'work', history: any[] = []) => {
  return apiCall('/api/ai/chat', {
      message: prompt,
      history,
      context,
      attachments: []
  });
};

export const sendMessageToGemini = async (
  text: string, 
  attachments: Attachment[], 
  context: { transactions: Transaction[], events: CalendarEvent[] },
  history: any[] = []
) => {
  // context (transactions/events) was unused in original implementation, so we ignore it here too.
  return apiCall('/api/ai/chat', {
      message: text,
      history,
      context: 'personal',
      attachments
  });
};

export const analyzeLead = async (lead: Lead) => {
  const res = await apiCall('/api/ai/analyze-lead', { lead });
  return res.text;
};

/**
 * Gera uma sugestão de resposta para WhatsApp baseada no contexto do lead.
 */
export const suggestWhatsAppReply = async (leadName: string, lastMessages: string[]) => {
  const res = await apiCall('/api/ai/suggest-reply', { leadName, lastMessages });
  return res.text;
};

/**
 * Gera um briefing diário com base nos eventos do usuário.
 */
export const generateDailyBriefing = async (events: CalendarEvent[]) => {
  const res = await apiCall('/api/ai/daily-briefing', { events });
  return res.text;
};
