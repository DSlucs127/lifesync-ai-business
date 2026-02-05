import React from 'react';
import { CalendarEvent } from '../../types';
import { Clock, Trash2, Repeat, Calendar as CalIcon, Edit2 } from 'lucide-react';

interface AgendaListProps {
  events: CalendarEvent[];
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
}

export const AgendaList: React.FC<AgendaListProps> = ({ events, onDeleteEvent, onEditEvent }) => {
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupedEvents: Record<string, CalendarEvent[]> = {};
  sortedEvents.forEach(e => {
    const day = new Date(e.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groupedEvents[day]) groupedEvents[day] = [];
    groupedEvents[day].push(e);
  });

  if (Object.keys(groupedEvents).length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">Nenhum evento encontrado para os filtros selecionados.</p>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date}>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 sticky top-0 bg-gray-50 py-2 capitalize z-10">{date}</h3>
            <div className="space-y-3">
            {dayEvents.map(event => (
                <div key={event.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:border-indigo-300 transition-colors group">
                    <div className="flex items-start space-x-4">
                        <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-[4rem] ${event.kind === 'routine' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            <span className="text-sm font-bold">{new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            {event.kind === 'routine' && <Repeat className="w-3 h-3 mt-1 opacity-50" />}
                            {event.kind === 'event' && <CalIcon className="w-3 h-3 mt-1 opacity-50" />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">{event.title}</h4>
                            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {event.durationMinutes} min
                                </span>
                                <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100">{event.category}</span>
                            </div>
                            {event.description && <p className="text-sm text-slate-600 mt-2">{event.description}</p>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => onEditEvent(event)}
                            className="text-slate-300 hover:text-indigo-600 transition-colors"
                            title="Editar"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => onDeleteEvent(event.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                            title="Excluir"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
            </div>
        </div>
      ))}
    </div>
  );
};