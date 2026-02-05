import React, { useState } from 'react';
import { AIChat } from './AIChat';
import { Transaction, CalendarEvent } from '../types';
import { MessageCircle, X, Minimize2, ChevronDown } from 'lucide-react';

interface FloatingChatProps {
  transactions: Transaction[];
  events: CalendarEvent[];
  // Fix: Update signatures to omit userId as it is handled by the useAppData hook
  onAddTransaction: (t: Omit<Transaction, 'id' | 'userId'>) => void;
  onAddEvent: (e: Omit<CalendarEvent, 'id' | 'userId'>) => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ 
  transactions, 
  events, 
  onAddTransaction, 
  onAddEvent 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Chat Window - Full Screen on Mobile, Floating on Desktop */}
      {isChatOpen && (
          <div className="
            fixed z-50 bg-white flex flex-col overflow-hidden animate-slideUp shadow-2xl
            inset-0 w-full h-full rounded-none
            md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[600px] md:rounded-2xl md:border md:border-slate-200
          ">
            {/* Header */}
            <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-3 flex justify-between items-center text-white shrink-0 cursor-pointer" 
                onClick={() => setIsChatOpen(false)}
            >
              <div className="flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="font-medium text-lg md:text-base">Assistente Gemini</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                  <div className="md:hidden"><ChevronDown className="w-6 h-6" /></div>
                  <div className="hidden md:block"><Minimize2 className="w-4 h-4" /></div>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">
              <AIChat 
                  transactions={transactions} 
                  events={events} 
                  onAddTransaction={onAddTransaction}
                  onAddEvent={onAddEvent}
                  onClose={() => setIsChatOpen(false)} 
              />
            </div>
          </div>
      )}

      {/* FAB Button - Hidden on Mobile when Chat is Open to avoid clutter */}
      <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`
              fixed bottom-24 md:bottom-6 right-6 z-40
              h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
              ${isChatOpen ? 'bg-slate-700 rotate-90 hidden md:flex' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 flex'}
          `}
      >
          {isChatOpen ? (
              <X className="w-6 h-6 text-white" />
          ) : (
              <MessageCircle className="w-7 h-7 text-white" />
          )}
      </button>
    </>
  );
};
