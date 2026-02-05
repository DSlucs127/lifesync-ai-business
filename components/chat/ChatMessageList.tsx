import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { Bot, User, Loader2, FileText } from 'lucide-react';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-start max-w-[90%] md:max-w-[85%] space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-600" /> : <Bot className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="flex flex-col items-end w-full min-w-0">
              {/* Render Attachments if any */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className={`mb-1 flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.attachments.map((att, idx) => (
                    <div key={idx} className="bg-white p-1 rounded border border-slate-200 shadow-sm max-w-[150px]">
                      {att.type === 'image' ? (
                        <img src={att.data} alt="attachment" className="w-full h-auto rounded max-h-32 object-cover" />
                      ) : (
                        <div className="flex items-center space-x-1 p-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-xs truncate max-w-[100px]">{att.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words w-full ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
           <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-xs text-slate-500">Analisando...</span>
           </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};