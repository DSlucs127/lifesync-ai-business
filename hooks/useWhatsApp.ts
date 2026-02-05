
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { WhatsAppMessage, WhatsAppConnectionState } from '../types';

// Relative path allows same-domain api calls on Cloud Run
const BACKEND_URL = '';

export const useWhatsApp = (contactId?: string) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado da Conexão
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnectionState>({ status: 'DISCONNECTED' });

  // 1. Polling de Status da Conexão (Para o QR Code)
  useEffect(() => {
      let isMounted = true;
      const fetchStatus = async () => {
          try {
              const res = await fetch(`${BACKEND_URL}/api/status`);
              if (res.ok) {
                  const data = await res.json();
                  if (isMounted) setConnectionStatus(data);
              }
          } catch (e) {
              console.error("Erro ao conectar com backend WhatsApp (verifique se o servidor está rodando)", e);
          }
      };

      fetchStatus();
      const interval = setInterval(fetchStatus, 5000); // Poll a cada 5s para não sobrecarregar
      return () => {
          isMounted = false;
          clearInterval(interval);
      };
  }, []);

  // 2. Escuta mensagens em tempo real do Firestore (se um contato for selecionado)
  useEffect(() => {
    if (!contactId || !auth.currentUser) return;

    const messagesRef = collection(db, 'users', auth.currentUser.uid, 'contacts', contactId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WhatsAppMessage));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [contactId]);

  // 3. Enviar Mensagem
  const sendMessage = async (content: string, type: 'text' = 'text') => {
    if (!contactId || !auth.currentUser) return;
    
    try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`${BACKEND_URL}/api/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: auth.currentUser.uid,
                contactId,
                type,
                content
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Falha ao enviar');
        }
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        alert("Erro ao enviar. Verifique se o WhatsApp está conectado e o backend ativo.");
    }
  };

  // 4. Desconectar
  const disconnect = async () => {
      try {
          await fetch(`${BACKEND_URL}/api/disconnect`, { method: 'POST' });
      } catch (e) {
          console.error(e);
      }
  };

  return { messages, sendMessage, loading, connectionStatus, disconnect };
};
