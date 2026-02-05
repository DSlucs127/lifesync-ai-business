
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const { GoogleGenAI, Type } = require('@google/genai');
const path = require('path');
require('dotenv').config();

// --- 1. CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
};

if (firebaseConfig.privateKey) {
    admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
} else {
    admin.initializeApp(); // Fallback para Application Default Credentials (Google Cloud)
}
const db = admin.firestore();

// --- 2. CONFIGURAÇÃO AI & PAGAMENTOS ---
const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
const mpClient = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-00000000' 
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));

// --- 3. SERVIR FRONTEND ESTÁTICO ---
app.use(express.static(path.join(__dirname, '../dist')));

// --- AI CONFIGURATION ---
const MODEL = 'gemini-2.0-flash-exp';

const tools = [
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

// --- 4. ROTA: CRM & WHATSAPP BOT (CÉREBRO) ---
app.post('/api/webhook/whatsapp', async (req, res) => {
    const { sender, message, name } = req.body;
    if (!sender || !message) return res.sendStatus(400);

    try {
        const contactsRef = db.collection('contacts');
        const snapshot = await contactsRef.where('phone', '==', sender).get();
        
        let contactId;
        let history = [];

        if (snapshot.empty) {
            const newContact = await contactsRef.add({
                name: name || sender,
                phone: sender,
                source: 'whatsapp_bot',
                createdAt: new Date().toISOString(),
                tags: ['novo_lead']
            });
            contactId = newContact.id;
        } else {
            contactId = snapshot.docs[0].id;
            const msgs = await contactsRef.doc(contactId).collection('messages')
                .orderBy('timestamp', 'desc').limit(5).get();
            history = msgs.docs.map(d => d.data()).reverse();
        }

        await contactsRef.doc(contactId).collection('messages').add({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        const prompt = `
            Você é um assistente de CRM e Vendas da LifeSync.
            Histórico da conversa: ${JSON.stringify(history)}.
            O cliente disse: "${message}".
            Responda de forma curta, persuasiva e tente agendar uma demonstração ou fechar venda.
            Se for suporte técnico, seja empático.
        `;

        const aiResponse = await aiClient.models.generateContent({
            model: MODEL,
            contents: prompt
        });
        
        const replyText = aiResponse.response.text();

        await contactsRef.doc(contactId).collection('messages').add({
            role: 'assistant',
            content: replyText,
            timestamp: new Date().toISOString()
        });

        res.json({ 
            reply_to: sender, 
            message: replyText 
        });

    } catch (error) {
        console.error("Erro no Bot:", error);
        res.status(500).send("Erro interno no processamento da IA");
    }
});

// --- 5. ROTA: AI SECURE ENDPOINTS ---

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history = [], context = 'personal', attachments = [] } = req.body;

        const systemInstruction = context === 'work'
            ? "Você é um Consultor de Vendas Digital. Sua missão é ajudar a converter leads em clientes e gerenciar o CRM. Sugira respostas educadas, profissionais e focadas em fechamento."
            : "Você é o LifeSync Assistant. Sua missão é organizar a vida do usuário. Processe gastos, agende compromissos e dê conselhos de produtividade.";

        const parts = [{ text: message }];

        if (attachments && attachments.length > 0) {
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
        }

        const contents = [...history, { role: 'user', parts }];

        const result = await aiClient.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: tools }]
            }
        });

        res.json(result.response);

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai/analyze-lead', async (req, res) => {
    try {
        const { lead } = req.body;
        const prompt = `Analise este lead e sugira 3 ações de fechamento.
        Lead: ${lead.name}, Valor: R$${lead.value}, Status: ${lead.status}.`;

        const response = await aiClient.models.generateContent({
            model: MODEL,
            contents: prompt,
            config: {
                systemInstruction: "Você é um especialista em Growth e Vendas B2B.",
                temperature: 0.7
            }
        });

        res.json({ text: response.response.text() });
    } catch (error) {
        console.error("Analyze Lead Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai/suggest-reply', async (req, res) => {
    try {
        const { leadName, lastMessages } = req.body;
        const prompt = `Baseado nas últimas mensagens com o cliente ${leadName}:
        "${lastMessages.join(' | ')}"
        Escreva uma resposta curta, amigável e profissional para o WhatsApp, incentivando o próximo passo.`;

        const response = await aiClient.models.generateContent({
            model: MODEL,
            contents: prompt,
            config: { systemInstruction: "Responda apenas com o texto da mensagem sugerida." }
        });

        res.json({ text: response.response.text() });
    } catch (error) {
        console.error("Suggest Reply Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai/daily-briefing', async (req, res) => {
    try {
        const { events } = req.body;
        const today = new Date();
        const todayStr = today.toDateString();
        const todaysEvents = events.filter(e => new Date(e.date).toDateString() === todayStr);

        if (todaysEvents.length === 0) {
            return res.json({ text: "Você não tem eventos agendados para hoje. Aproveite para organizar suas tarefas!" });
        }

        const eventsList = todaysEvents.map(e =>
            `- ${e.title} às ${new Date(e.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} (${e.durationMinutes} min)`
        ).join('\n');

        const prompt = `Gere um briefing matinal curto, direto e motivador para o usuário com base nestes eventos de hoje (${today.toLocaleDateString('pt-BR')}):\n${eventsList}\nFale em português do Brasil. Resuma em no máximo 2 frases.`;

        const response = await aiClient.models.generateContent({
            model: MODEL,
            contents: prompt,
            config: {
                systemInstruction: "Você é um assistente pessoal útil e motivador.",
            }
        });

        res.json({ text: response.response.text() });
    } catch (error) {
        console.error("Daily Briefing Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- 6. ROTA: ASSINATURAS ---
app.post('/api/subscribe', async (req, res) => {
    const { email, plan, cardToken, userId } = req.body;
    try {
        const preApproval = new PreApproval(mpClient);
        const planPrices = { 'pro': 29.90, 'business_solo': 99.90 };
        
        const subscription = await preApproval.create({
            body: {
                reason: `LifeSync ${plan}`,
                external_reference: userId,
                payer_email: email,
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    transaction_amount: planPrices[plan] || 29.90,
                    currency_id: 'BRL'
                },
                back_url: 'https://lifesync.ai/settings',
                status: 'authorized',
                card_token_id: cardToken
            }
        });

        await db.collection('subscriptions').doc(userId).set({
            plan,
            status: 'active',
            mpId: subscription.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ id: subscription.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 7. ROTA: FALLBACK (SPA) ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`LifeSync Monolith rodando na porta ${PORT}`));
