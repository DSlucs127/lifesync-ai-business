import { Transaction, CalendarEvent, Attachment, Lead } from "../types";

export const geminiChat = async (prompt: string, context: 'personal' | 'work', history: any[] = []) => {
  return { response: { text: () => "AI disabled by configuration." } };
};

export const sendMessageToGemini = async (
  text: string, 
  attachments: Attachment[], 
  context: { transactions: Transaction[], events: CalendarEvent[] },
  history: any[] = []
) => {
  return { response: { text: () => "AI disabled by configuration." } };
};

export const analyzeLead = async (lead: Lead) => {
  return "AI Analysis disabled.";
};

export const suggestWhatsAppReply = async (leadName: string, lastMessages: string[]) => {
  return "AI Reply disabled.";
};

export const generateDailyBriefing = async (events: CalendarEvent[]) => {
  return "Daily briefing AI disabled.";
};
