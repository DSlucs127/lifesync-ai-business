import React, { useState } from 'react';
import { CalendarEvent } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendaCalendarProps {
  events: CalendarEvent[];
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-slate-100">
        <h3 className="font-bold text-lg text-slate-800 capitalize">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 auto-rows-fr">
        {blanks.map(i => <div key={`blank-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30"></div>)}
        
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <div key={day} className={`min-h-[100px] border-b border-r border-slate-100 p-1 relative group ${isToday ? 'bg-indigo-50/30' : ''}`}>
              <span className={`text-xs font-medium p-1 rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.map(e => (
                    <div key={e.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${e.kind === 'routine' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                        {new Date(e.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})} {e.title}
                    </div>
                ))}
                {dayEvents.length > 3 && (
                    <div className="text-[9px] text-center text-slate-400">+ {dayEvents.length - 3} mais</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};