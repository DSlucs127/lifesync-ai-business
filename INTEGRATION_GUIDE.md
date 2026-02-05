
# Guia de Integração: WhatsApp CRM & Automação

Este documento descreve a arquitetura para integrar o WhatsApp real ao LifeSync CRM, utilizando ferramentas open-source self-hosted para garantir privacidade e baixo custo.

## 🏗 Arquitetura do Sistema

O fluxo de dados segue o padrão Webhook:

1.  **WhatsApp (Meta)** -> Recebe mensagem do cliente.
2.  **Evolution API (Gateway)** -> Processa o protocolo WhatsApp e envia JSON.
3.  **LifeSync Backend (Cloud Run/Node.js)** -> Recebe o Webhook.
    *   Salva mensagem no **Firebase Firestore**.
    *   Analisa intenção com **Gemini AI**.
    *   Gera resposta automática (se configurado).
4.  **Chatwoot (Opcional)** -> Interface para atendimento humano se a IA não resolver.

---

## 🚀 Passo 1: Evolution API (Gateway WhatsApp)

A Evolution API substitui a necessidade de APIs oficiais caras ou Twilio para volumes médios.

### Docker Compose (Recomendado)
Crie uma instância em um VPS (DigitalOcean, Hetzner, AWS) usando o arquivo `services/evolution-api/docker-compose.yml` fornecido no projeto.

```yaml
# Exemplo de configuração
environment:
  - SERVER_URL=https://api.seudominio.com
  - API_KEY=SuaChaveSegura123
  - AUTHENTICATION_API_KEY=SuaChaveSegura123
```

### Configuração do Webhook
Após subir a API e ler o QR Code:
1.  Acesse o painel da Evolution API.
2.  Vá em **Webhooks**.
3.  Defina a URL: `https://seu-backend-lifesync.run.app/api/webhook/whatsapp`
4.  Marque os eventos: `MESSAGES_UPSERT`, `MESSAGES_UPDATE`.

---

## 💬 Passo 2: Chatwoot (Atendimento Humano)

O Chatwoot serve como painel para quando você ou sua equipe precisam intervir na conversa da IA.

1.  Suba o Chatwoot usando `services/chatwoot/docker-compose.yml`.
2.  Crie uma **Caixa de Entrada de API** no Chatwoot.
3.  No backend do LifeSync (`backend/index.js`), configure para que, quando a IA detectar "sentimento negativo" ou "solicitação de humano", ela encaminhe a conversa para o Chatwoot via API.

---

## 🔥 Passo 3: Backend & Firebase (O Cérebro)

O arquivo `backend/index.js` é o orquestrador.

### Estrutura de Dados no Firestore
Para garantir que o frontend (React) mostre os dados em tempo real:

```javascript
// Coleção: users/{adminId}/contacts/{contactId}
{
  name: "Nome do Cliente",
  phone: "551199999999",
  lastMessage: "Gostaria de um orçamento...",
  lastActivity: Timestamp,
  tags: ["novo_lead", "whatsapp"],
  assignedTo: "userId_do_vendedor"
}

// Coleção: users/{adminId}/contacts/{contactId}/messages/{msgId}
{
  role: "user" | "assistant" | "agent",
  content: "Texto da mensagem",
  timestamp: Timestamp,
  status: "sent" | "read"
}
```

### Regras de Segurança (firestore.rules)
Garanta que apenas o dono do CRM ou membros da equipe possam ler as mensagens:

```javascript
match /users/{userId}/contacts/{contactId}/messages/{msgId} {
  allow read, write: if request.auth.uid == userId || 
     exists(/databases/$(database)/documents/organization_members/$(request.auth.uid));
}
```

---

## 🤖 Passo 4: Configuração da IA (Gemini)

No arquivo `backend/index.js`, a IA deve ser configurada com instruções de sistema específicas para não alucinar:

**System Prompt Ideal:**
> "Você é o assistente de vendas da LifeSync. Seu objetivo é qualificar leads.
> 1. Responda de forma curta (max 2 frases).
> 2. Se o cliente perguntar preço, peça o e-mail primeiro.
> 3. Se o cliente estiver irritado, retorne a tag [HUMANO_NECESSARIO]."

---

## ✅ Checklist de Produção

- [ ] Variáveis de ambiente configuradas no Cloud Run.
- [ ] Banco de dados do Chatwoot (Postgres) com backup automático.
- [ ] Evolution API protegida por API Key.
- [ ] Firebase Rules em modo restrito (não use modo de teste).
