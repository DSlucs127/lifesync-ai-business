
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const { GoogleGenAI } = require('@google/genai');
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
app.use(express.json());

// --- 3. SERVIR FRONTEND ESTÁTICO ---
// O Cloud Run roda 'npm run build' antes, gerando a pasta 'dist'
app.use(express.static(path.join(__dirname, '../dist')));

// --- 4. ROTA: CRM & WHATSAPP BOT (CÉREBRO) ---
app.post('/api/webhook/whatsapp', async (req, res) => {
    // Esta rota recebe mensagens de um Gateway (ex: Evolution API, Twilio ou Meta Cloud API)
    // Formato genérico de entrada: { sender: '551199999999', message: 'Olá', name: 'João' }
    const { sender, message, name } = req.body;

    if (!sender || !message) return res.sendStatus(400);

    try {
        // A. Buscar ou Criar Contato no CRM
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
            // Carregar histórico recente (simplificado)
            const msgs = await contactsRef.doc(contactId).collection('messages')
                .orderBy('timestamp', 'desc').limit(5).get();
            history = msgs.docs.map(d => d.data()).reverse();
        }

        // B. & C. Executar em paralelo: Salvar mensagem do usuário e Consultar Gemini
        const saveMessagePromise = contactsRef.doc(contactId).collection('messages').add({
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

        const aiResponsePromise = aiClient.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        const [, aiResponse] = await Promise.all([saveMessagePromise, aiResponsePromise]);
        
        const replyText = aiResponse.response.text();

        // D. Salvar resposta da IA no CRM
        await contactsRef.doc(contactId).collection('messages').add({
            role: 'assistant',
            content: replyText,
            timestamp: new Date().toISOString()
        });

        // E. Retornar resposta para o Gateway enviar ao WhatsApp
        // O Gateway deve pegar esse JSON e enviar a msg real
        res.json({ 
            reply_to: sender, 
            message: replyText 
        });

    } catch (error) {
        console.error("Erro no Bot:", error);
        res.status(500).send("Erro interno no processamento da IA");
    }
});

// --- 5. ROTA: ASSINATURAS ---
app.post('/api/subscribe', async (req, res) => {
    const { email, plan, cardToken, userId } = req.body;
    try {
        const preApproval = new PreApproval(mpClient);
        const planPrices = { 'pro': 29.90, 'business_solo': 99.90 }; // Adicione outros planos
        
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
            status: 'active', // Em prod, aguardar webhook para confirmar
            mpId: subscription.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ id: subscription.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 6. ROTA: FALLBACK (SPA) ---
// Garante que qualquer rota não-API (ex: /dashboard) carregue o React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`LifeSync Monolith rodando na porta ${PORT}`));
