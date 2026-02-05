import React, { useState } from 'react';
import { CalendarEvent } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendaWeekProps {
  events: CalendarEvent[];
}

export const AgendaWeek: React.FC<AgendaWeekProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get Start of Week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
        const eDate = new Date(e.date);
        return eDate.toDateString() === date.toDateString();
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
       <div className="flex justify-between items-center p-4 border-b border-slate-100 flex-shrink-0">
        <h3 className="font-bold text-lg text-slate-800">
            {weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
        </h3>
        <div className="flex space-x-2">
            <button onClick={prevWeek} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextWeek} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 min-h-full divide-x divide-slate-100">
            {weekDays.map((day, idx) => {
                 const isToday = day.toDateString() === new Date().toDateString();
                 const dayEvents = getEventsForDay(day);

                 return (
                    <div key={idx} className="flex flex-col">
                        <div className={`p-2 text-center border-b border-slate-100 sticky top-0 bg-white z-10 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                            <p className="text-xs text-slate-500 uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                            <p className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>{day.getDate()}</p>
                        </div>
                        <div className="flex-1 p-1 space-y-2 bg-slate-50/10">
                            {dayEvents.map(e => (
                                <div key={e.id} className={`p-2 rounded border text-xs shadow-sm ${e.kind === 'routine' ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-white border-slate-200 text-slate-800'}`}>
                                    <div className="font-bold mb-0.5">{new Date(e.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
                                    <div className="truncate font-medium">{e.title}</div>
                                    <div className="text-[10px] opacity-75">{e.durationMinutes}m</div>
                                </div>
                            ))}
                        </div>
                    </div>
                 );
            })}
        </div>
      </div>
    </div>
  );
};