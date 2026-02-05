
import React, { useState } from 'react';
import { SupportTicket, TicketEvent, TeamMember, Contact } from '../../types';
import { X, Send, User, MessageSquare, AlertCircle, Clock, Lock, MessageCircle } from 'lucide-react';
import { Button } from '../Button';
import { WhatsAppChat } from './WhatsAppChat';

interface TicketDetailModalProps {
  ticket: SupportTicket;
  teamMembers: TeamMember[];
  contacts: Contact[];
  onClose: () => void;
  onUpdate: (ticket: SupportTicket) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, teamMembers, contacts, onClose, onUpdate }) => {
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'internal' | 'whatsapp'>('history');
  
  const contact = contacts?.find(c => c.id === ticket.contactId);

  const handleAddEvent = (type: TicketEvent['type'], content: string) => {
      const newEvent: TicketEvent = {
          id: Date.now().toString(),
          type,
          authorId: 'user_self', // Mock current user
          content,
          timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [...(ticket.history || []), newEvent];
      onUpdate({ ...ticket, history: updatedHistory });
      setNewNote('');
  };

  const statusColors = {
      open: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full md:w-[700px] h-full shadow-2xl flex flex-col animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-start bg-slate-50">
           <div>
               <div className="flex items-center space-x-2 mb-1">
                   <span className="font-mono text-slate-500 text-sm font-bold">{ticket.ticketNumber}</span>
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[ticket.status]}`}>
                       {ticket.status}
                   </span>
               </div>
               <h2 className="text-lg font-bold text-slate-900 leading-tight">{ticket.title}</h2>
               <p className="text-xs text-slate-500 mt-1">Cliente: {contact?.name || 'N/A'}</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-100 grid grid-cols-2 gap-4 bg-white">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Atribuído a</label>
                <select 
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                    value={ticket.assignedTo || ''}
                    onChange={(e) => onUpdate({...ticket, assignedTo: e.target.value})}
                >
                    <option value="">Não atribuído</option>
                    {teamMembers.map(tm => (
                        <option key={tm.id} value={tm.id}>{tm.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                 <select 
                    className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                    value={ticket.status}
                    onChange={(e) => {
                        onUpdate({...ticket, status: e.target.value as any});
                        handleAddEvent('status_change', `Status alterado para ${e.target.value}`);
                    }}
                >
                    <option value="open">Aberto</option>
                    <option value="pending">Pendente</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                </select>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Histórico
            </button>
            <button 
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${activeTab === 'whatsapp' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                WhatsApp <MessageCircle className="w-4 h-4 ml-1" />
            </button>
            <button 
                onClick={() => setActiveTab('internal')}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'internal' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Notas <Lock className="w-3 h-3 inline ml-1" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
            
            {/* TAB HISTORY */}
            {activeTab === 'history' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {ticket.history?.map((event) => (
                        <div key={event.id} className="flex space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                    {event.authorId === 'system' ? 'SYS' : 'U'}
                                </div>
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-slate-700">
                                        {event.authorId === 'system' ? 'Sistema' : 'Agente'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">{event.content}</p>
                                {event.type === 'status_change' && (
                                    <div className="mt-2 text-xs text-indigo-500 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" /> Log de alteração
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!ticket.history || ticket.history.length === 0) && (
                        <p className="text-center text-slate-400 text-sm">Nenhum histórico.</p>
                    )}
                </div>
            )}

            {/* TAB WHATSAPP */}
            {activeTab === 'whatsapp' && (
                <div className="flex-1 flex flex-col h-full">
                    {contact ? (
                        <WhatsAppChat contact={contact} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center">
                            <div>
                                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Este ticket não está vinculado a um contato com WhatsApp.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB INTERNAL NOTES */}
            {activeTab === 'internal' && (
                <div className="h-full flex flex-col p-4">
                    <textarea 
                        className="w-full h-full p-3 rounded-lg border border-slate-200 text-sm resize-none focus:ring-indigo-500"
                        placeholder="Notas visíveis apenas para a equipe..."
                        value={ticket.internalNotes || ''}
                        onChange={(e) => onUpdate({...ticket, internalNotes: e.target.value})}
                    />
                    <p className="text-xs text-slate-500 mt-2 flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> As notas são salvas automaticamente.
                    </p>
                </div>
            )}
        </div>

        {/* Input Area (Only for History Tab) */}
        {activeTab === 'history' && (
             <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input 
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Adicionar resposta ou atualização..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEvent('reply', newNote)}
                />
                <Button onClick={() => handleAddEvent('reply', newNote)} disabled={!newNote.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        )}

      </div>
    </div>
  );
};
