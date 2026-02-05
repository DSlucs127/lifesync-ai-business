
import React, { useState, useEffect, useRef } from 'react';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { Contact } from '../../types';
import { Send, Phone, MoreVertical, Paperclip, Check, CheckCheck, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import { suggestWhatsAppReply } from '../../services/geminiService';

interface WhatsAppChatProps {
  contact: Contact;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ contact }) => {
  const { messages, sendMessage } = useWhatsApp(contact.id);
  const [input, setInput] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!input.trim()) return;
      sendMessage(input);
      setInput('');
  };

  const handleAISuggestion = async () => {
    if (messages.length === 0 || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const lastMsgs = messages.slice(-5).map(m => `${m.direction === 'inbound' ? 'Cliente' : 'Eu'}: ${m.content}`);
      const suggestion = await suggestWhatsAppReply(contact.name, lastMsgs);
      if (suggestion) setInput(suggestion);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
        <div className="bg-[#f0f2f5] px-4 py-3 border-b border-slate-300 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {contact.name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{contact.name}</h3>
                    <div className="flex items-center text-[10px] text-emerald-600 font-bold">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></div>
                        ONLINE
                    </div>
                </div>
            </div>
            <div className="flex space-x-3 text-slate-500">
                <button 
                  onClick={handleAISuggestion}
                  className={`p-2 rounded-full transition-all ${isSuggesting ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-indigo-50 hover:text-indigo-600'}`}
                  title="Sugestão de resposta IA"
                >
                  {isSuggesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
                <button className="p-2 hover:bg-slate-200 rounded-full"><Phone className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-slate-200 rounded-full"><MoreVertical className="w-5 h-5" /></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded-lg shadow-sm text-sm relative ${msg.direction === 'outbound' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                        <p className="text-slate-800 pr-6 pb-2 break-words">{msg.content}</p>
                        <div className="absolute bottom-1 right-2 flex items-center space-x-1">
                            <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                            {msg.direction === 'outbound' && <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-blue-500' : 'text-slate-400'}`} />}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-[#f0f2f5] p-3 flex flex-col gap-2 shrink-0">
            {input && !isSuggesting && (
                <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex items-center justify-between mb-1 animate-fadeIn">
                    <span className="text-[10px] font-bold text-indigo-600 flex items-center uppercase"><Sparkles className="w-3 h-3 mr-1" /> Sugestão da IA</span>
                    <button onClick={() => setInput('')} className="text-slate-400 hover:text-red-500"><Check className="w-4 h-4 rotate-45" /></button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <button className="text-slate-500 hover:text-slate-700 p-2"><Paperclip className="w-5 h-5" /></button>
                <form onSubmit={handleSend} className="flex-1 flex gap-2">
                    <input 
                        className="flex-1 rounded-full border-none px-4 py-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white text-sm shadow-sm"
                        placeholder="Mensagem..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button type="submit" disabled={!input.trim()} className="bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md">
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    </div>
  );
};
