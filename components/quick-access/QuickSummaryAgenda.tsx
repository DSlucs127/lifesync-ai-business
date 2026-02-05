import React from 'react';
import { CalendarEvent } from '../../types';
import { Clock, Calendar } from 'lucide-react';

interface QuickSummaryAgendaProps {
  events: CalendarEvent[];
}

export const QuickSummaryAgenda: React.FC<QuickSummaryAgendaProps> = ({ events }) => {
  const now = new Date();
  
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (upcomingEvents.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Calendar className="w-8 h-8 mb-2 opacity-30" />
              <span className="text-xs">Agenda livre.</span>
          </div>
      );
  }

  return (
    <div className="space-y-3">
      {upcomingEvents.map((event, index) => {
        const date = new Date(event.date);
        const isToday = date.toDateString() === now.toDateString();
        
        return (
          <div key={event.id} className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl border border-white/50 shadow-sm hover:bg-white transition-colors group">
            <div className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0
                ${index === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}
            `}>
                <span className="text-xs font-bold uppercase">{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')}</span>
                <span className="text-sm font-bold">{date.getDate()}</span>
            </div>
            
            <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-slate-800 truncate">{event.title}</h4>
                <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className={isToday ? "text-indigo-600 font-bold" : ""}>
                        {isToday ? 'Hoje, ' : ''}{date.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{event.durationMinutes} min</span>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};