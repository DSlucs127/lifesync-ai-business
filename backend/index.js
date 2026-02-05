const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { MercadoPagoConfig, PreApproval } = require('mercadopago');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

// --- CONFIGURAÇÃO ---
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
};

if (firebaseConfig.privateKey) {
    admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
} else {
    admin.initializeApp();
}
const db = admin.firestore();

const mpClient = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-00000000' 
});

// Chatwoot & Evolution Config
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || 'Lifesync';
const CHATWOOT_API_URL = process.env.CHATWOOT_API_URL;
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN;
const CHATWOOT_INBOX_ID = process.env.CHATWOOT_INBOX_ID;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || 1;
const ADMIN_ID = process.env.ADMIN_ID || 'admin_default';

// --- HELPERS ---
async function sendMessageViaEvolution(phone, text) {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) return;
    try {
        await axios.post(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            number: phone,
            options: { delay: 1200, presence: "composing", linkPreview: false },
            textMessage: { text: text }
        }, {
            headers: { apikey: EVOLUTION_API_KEY }
        });
    } catch (e) {
        console.error('Error sending via Evolution:', e.message);
    }
}

async function findOrCreateChatwootContact(name, phone) {
    if (!CHATWOOT_API_URL) return null;
    try {
        const searchRes = await axios.get(`${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search`, {
            params: { q: phone },
            headers: { api_access_token: CHATWOOT_API_TOKEN }
        });

        if (searchRes.data.payload.length > 0) {
            return searchRes.data.payload[0].id;
        }

        const createRes = await axios.post(`${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`, {
            name: name,
            phone_number: '+' + phone,
        }, {
            headers: { api_access_token: CHATWOOT_API_TOKEN }
        });
        return createRes.data.payload.contact.id;
    } catch (e) {
        console.error('Error managing Chatwoot contact:', e.message);
        return null;
    }
}

async function createChatwootConversation(sourceId, contactId) {
    if (!CHATWOOT_API_URL) return null;
    try {
        // For API Inbox, we just post to conversation.
        const res = await axios.post(`${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`, {
            source_id: sourceId,
            inbox_id: CHATWOOT_INBOX_ID,
            contact_id: contactId,
            status: 'open'
        }, {
            headers: { api_access_token: CHATWOOT_API_TOKEN }
        });
        return res.data.id;
    } catch (e) {
        console.error('Error creating Chatwoot conversation:', e.message);
        return null;
    }
}

async function postMessageToChatwoot(conversationId, content, messageType = 'incoming') {
    if (!CHATWOOT_API_URL || !conversationId) return;
    try {
        await axios.post(`${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`, {
            content: content,
            message_type: messageType,
            private: false
        }, {
             headers: { api_access_token: CHATWOOT_API_TOKEN }
        });
    } catch (e) {
        console.error('Error posting to Chatwoot:', e.message);
    }
}


const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// --- ROTA: CRM & WHATSAPP (EVOLUTION -> APP) ---
app.post('/api/webhook/whatsapp', async (req, res) => {
    const { type, data, sender } = req.body;

    // Simplified extraction based on typical payloads
    const msgData = data || req.body;
    const phone = msgData.key?.remoteJid?.replace('@s.whatsapp.net', '') || sender;
    const name = msgData.pushName || msgData.name || phone;
    let messageText = '';

    if (msgData.message?.conversation) messageText = msgData.message.conversation;
    else if (msgData.message?.extendedTextMessage?.text) messageText = msgData.message.extendedTextMessage.text;
    else if (req.body.message) messageText = req.body.message;

    if (!phone || !messageText) return res.sendStatus(200);

    try {
        // 1. Save to Firestore (LifeSync CRM)
        const contactsRef = db.collection(`users/${ADMIN_ID}/contacts`);
        const snapshot = await contactsRef.where('phone', '==', phone).get();
        
        let contactId;
        if (snapshot.empty) {
            const newContact = await contactsRef.add({
                name: name,
                phone: phone,
                source: 'whatsapp',
                createdAt: new Date().toISOString(),
                tags: ['novo_lead'],
                lastMessage: messageText,
                lastActivity: admin.firestore.FieldValue.serverTimestamp()
            });
            contactId = newContact.id;
        } else {
            contactId = snapshot.docs[0].id;
            await contactsRef.doc(contactId).update({
                lastMessage: messageText,
                lastActivity: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        await contactsRef.doc(contactId).collection('messages').add({
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        });

        // 2. Forward to Chatwoot
        if (CHATWOOT_API_URL) {
            const cwContactId = await findOrCreateChatwootContact(name, phone);
            if (cwContactId) {
                const conversationId = await createChatwootConversation(phone, cwContactId);
                if (conversationId) {
                    await postMessageToChatwoot(conversationId, messageText, 'incoming');
                }
            }
        }

        res.json({ status: 'processed' });
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);
    }
});

// --- ROTA: CHATWOOT -> WHATSAPP ---
app.post('/api/webhook/chatwoot', async (req, res) => {
    const { event, content, conversation, message_type } = req.body;

    if (event === 'message_created' && message_type === 'outgoing' && !req.body.private) {
        const phone = conversation?.meta?.sender?.phone_number?.replace('+', '');
        const text = content;

        if (phone && text) {
             // Save to Firestore for consistency
             try {
                const contactsRef = db.collection(`users/${ADMIN_ID}/contacts`);
                const snapshot = await contactsRef.where('phone', '==', phone).get();
                if (!snapshot.empty) {
                    const contactId = snapshot.docs[0].id;
                    await contactsRef.doc(contactId).collection('messages').add({
                        role: 'agent',
                        content: text,
                        timestamp: new Date().toISOString()
                    });
                }
             } catch(e) { console.error("Error saving outgoing msg:", e); }

             // Send to WhatsApp
             await sendMessageViaEvolution(phone, text);
        }
    }
    res.sendStatus(200);
});

// --- ROTA: ASSINATURAS ---
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

// --- FALLBACK ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`LifeSync Backend running on port ${PORT}`));
