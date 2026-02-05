
import React, { useState } from 'react';
import { SupportTicket } from '../../types';
import { useAppData } from '../../hooks/useAppData';
import { AlertCircle, CheckCircle2, Clock, Filter, MessageSquare, Plus, Search, Eye } from 'lucide-react';
import { Button } from '../Button';
import { TicketDetailModal } from './TicketDetailModal';

export const HelpdeskBoard: React.FC = () => {
  const { tickets, teamMembers, addTicket, updateTicket, contacts } = useAppData();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getPriorityColor = (p: string) => {
    switch(p) {
        case 'critical': return 'bg-red-100 text-red-700 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-slate-100';
    }
  };

  const getStatusBadge = (s: string) => {
      switch(s) {
          case 'open': return <span className="flex items-center text-red-600 font-bold text-xs"><AlertCircle className="w-3 h-3 mr-1" /> Aberto</span>;
          case 'pending': return <span className="flex items-center text-yellow-600 font-bold text-xs"><Clock className="w-3 h-3 mr-1" /> Pendente</span>;
          case 'resolved': return <span className="flex items-center text-emerald-600 font-bold text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolvido</span>;
          case 'closed': return <span className="flex items-center text-slate-500 font-bold text-xs">Fechado</span>;
          default: return <span>{s}</span>;
      }
  };

  const handleAddTicket = () => {
      addTicket({
          title: 'Novo chamado',
          priority: 'medium',
          status: 'open',
          tags: ['Geral'],
          department: 'support',
          slaDue: new Date(Date.now() + 86400000).toISOString()
      });
  };

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-6 animate-fadeIn pb-24 h-full flex flex-col">
        <div className="flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Central de Suporte</h2>
                <p className="text-slate-500 text-sm">Gerencie tickets e atendimento.</p>
            </div>
            <Button onClick={handleAddTicket}><Plus className="w-4 h-4 mr-2" /> Novo Ticket</Button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 shrink-0">
             <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input className="w-full pl-9 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Buscar ticket..." />
             </div>
             <select 
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
             >
                 <option value="all">Todos os Status</option>
                 <option value="open">Abertos</option>
                 <option value="pending">Pendentes</option>
                 <option value="resolved">Resolvidos</option>
             </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ticket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assunto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Solicitante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Atribuído a</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Prioridade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredTickets.map(ticket => {
                            const assignee = teamMembers.find(tm => tm.id === ticket.assignedTo);
                            const contact = contacts?.find(c => c.id === ticket.contactId);
                            
                            return (
                                <tr key={ticket.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{ticket.ticketNumber}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{ticket.title}</p>
                                        <div className="flex gap-1 mt-1">
                                            {ticket.tags.map(t => <span key={t} className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-600">{t}</span>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{contact?.name || 'Cliente desconhecido'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {assignee ? (
                                            <span className="flex items-center">
                                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold mr-2">
                                                    {assignee.name.charAt(0)}
                                                </span>
                                                {assignee.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getPriorityColor(ticket.priority)} uppercase`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(ticket.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredTickets.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                                    Nenhum ticket encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {selectedTicket && (
            <TicketDetailModal 
                ticket={selectedTicket}
                teamMembers={teamMembers}
                contacts={contacts}
                onClose={() => setSelectedTicket(null)}
                onUpdate={updateTicket}
            />
        )}
    </div>
  );
};
