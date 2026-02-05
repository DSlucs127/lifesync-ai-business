
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, CalendarEvent, ChatMessage, Attachment } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessageList } from './chat/ChatMessageList';
import { ChatInput } from './chat/ChatInput';
import { AttachmentPreview } from './chat/AttachmentPreview';

interface AIChatProps {
  transactions: Transaction[];
  events: CalendarEvent[];
  // Fix: Update signatures to omit userId
  onAddTransaction?: (t: Omit<Transaction, 'id' | 'userId'>) => void;
  onAddEvent?: (e: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  onClose?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ transactions, events, onAddTransaction, onAddEvent }) => {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! Posso ajudar a registrar gastos ou agendar eventos. Você pode enviar comprovantes, áudios ou texto.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // -- Speech Recognition Logic --
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pt-BR';

        recognitionRef.current.onresult = (event: any) => {
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
             if(isListening) {
                 setIsListening(false);
             }
        };
    }
  }, [isListening]);

  const toggleListening = () => {
      if (!recognitionRef.current) {
          alert("Seu navegador não suporta reconhecimento de voz.");
          return;
      }

      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };

  // -- File Handling Logic --
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          
          const reader = new FileReader();
          reader.onload = () => {
              const base64 = reader.result as string;
              const type = file.type.startsWith('image/') ? 'image' : 'file';
              
              setAttachments(prev => [...prev, {
                  type,
                  mimeType: file.type,
                  data: base64,
                  name: file.name
              }]);
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // -- Send Logic --
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userText = input;
    const currentAttachments = [...attachments];
    
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const userMsg: ChatMessage = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: userText, 
        timestamp: Date.now(),
        attachments: currentAttachments
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const history = messages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const response = await sendMessageToGemini(userText, currentAttachments, { transactions, events }, history);

      if (response && response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        let responseText = candidate.content.parts.filter(p => p.text).map(p => p.text).join('') || '';

        // Process Tool Calls
        const functionCalls = candidate.content.parts.filter(p => p.functionCall).map(p => p.functionCall);

        if (functionCalls.length > 0) {
           for (const call of functionCalls) {
              if (call.name === 'addTransaction' && onAddTransaction) {
                 const args = call.args as any;
                 onAddTransaction({
                    description: args.description,
                    amount: Number(args.amount),
                    type: args.type,
                    category: args.category,
                    date: args.date
                 });
                 responseText += `\n\n✅ Transação "${args.description}" (R$ ${args.amount}) adicionada.`;
              } else if (call.name === 'addEvent' && onAddEvent) {
                 const args = call.args as any;
                 // Fix: Map tool call arguments to CalendarEvent correctly
                 onAddEvent({
                    title: args.title,
                    date: args.date,
                    durationMinutes: Number(args.durationMinutes),
                    category: args.type || 'Geral', // Map 'type' from tool to 'category'
                    kind: 'personal', // Mapping to valid literal
                    recurrence: 'none',
                    description: args.description
                 });
                 responseText += `\n\n✅ Evento "${args.title}" agendado.`;
              }
           }
        }
        
        if (!responseText && functionCalls.length > 0) responseText = "Processado com sucesso.";
        if (!responseText) responseText = "Não consegui processar essa solicitação.";

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: responseText,
            timestamp: Date.now()
        }]);
      } else {
         throw new Error("Sem resposta");
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Desculpe, tive um problema ao conectar com a IA.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fadeIn">
      
      <ChatMessageList messages={messages} isLoading={isLoading} />

      <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />

      <ChatInput 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        isListening={isListening}
        hasAttachments={attachments.length > 0}
        onToggleListening={toggleListening}
        onFileSelect={handleFileSelect}
        onSend={handleSend}
      />
    </div>
  );
};
