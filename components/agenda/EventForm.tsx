
import React, { useState } from 'react';
import { CalendarEvent, AGENDA_CATEGORIES } from '../../types';
import { Input, Select } from '../Input';
import { Button } from '../Button';
import { Bell, Clock, Mail } from 'lucide-react';

interface EventFormProps {
  onAddEvent: (e: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ onAddEvent, onCancel }) => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 16),
    duration: '60',
    category: 'Trabalho',
    kind: 'event',
    recurrence: 'none',
    description: '',
    reminders: [10], // Default 10 min before
    notifyEmail: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({
      title: newEvent.title,
      date: new Date(newEvent.date).toISOString(),
      durationMinutes: parseInt(newEvent.duration),
      category: newEvent.category,
      kind: newEvent.kind as 'event' | 'routine',
      recurrence: newEvent.recurrence as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
      description: newEvent.description,
      reminders: newEvent.reminders
    });
  };

  const toggleReminder = (minutes: number) => {
    setNewEvent(prev => {
      const exists = prev.reminders.includes(minutes);
      return {
        ...prev,
        reminders: exists 
          ? prev.reminders.filter(r => r !== minutes)
          : [...prev.reminders, minutes]
      };
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-slideDown mb-6">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
             <Clock className="w-5 h-5 mr-2 text-indigo-600" />
             Novo Evento
          </h3>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
             <Input 
                label="Título do Evento" 
                placeholder="Ex: Reunião de Planejamento"
                required
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
             />
        </div>

        <Input 
          label="Data e Hora de Início" 
          type="datetime-local" 
          required
          value={newEvent.date}
          onChange={e => setNewEvent({...newEvent, date: e.target.value})}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <Input 
                label="Duração (min)" 
                type="number" 
                required
                value={newEvent.duration}
                onChange={e => setNewEvent({...newEvent, duration: e.target.value})}
            />
            <Select 
                label="Classificação"
                options={[
                    {value: 'event', label: 'Evento Único'},
                    {value: 'routine', label: 'Rotina (Hábito)'}
                ]}
                value={newEvent.kind}
                onChange={e => setNewEvent({...newEvent, kind: e.target.value})}
            />
        </div>

        <Select 
            label="Categoria"
            options={AGENDA_CATEGORIES.map(t => ({value: t, label: t}))}
            value={newEvent.category}
            onChange={e => setNewEvent({...newEvent, category: e.target.value})}
        />
        
        <Select 
            label="Recorrência"
            options={[
                {value: 'none', label: 'Não repete'},
                {value: 'daily', label: 'Diariamente'},
                {value: 'weekly', label: 'Semanalmente'},
                {value: 'monthly', label: 'Mensalmente'},
                {value: 'yearly', label: 'Anualmente'}
            ]}
            value={newEvent.recurrence}
            onChange={e => setNewEvent({...newEvent, recurrence: e.target.value})}
        />

        {/* Enhanced Notifications Section */}
        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <label className="flex items-center text-sm font-bold text-slate-700 mb-3">
                <Bell className="w-4 h-4 mr-2 text-indigo-600" />
                Configurar Notificações
            </label>
            
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Na hora', val: 0 },
                      { label: '10m antes', val: 10 },
                      { label: '30m antes', val: 30 },
                      { label: '1h antes', val: 60 },
                      { label: '1 dia antes', val: 1440 }
                    ].map((opt) => (
                       <button
                          key={opt.val}
                          type="button"
                          onClick={() => toggleReminder(opt.val)}
                          className={`
                            text-xs px-3 py-1.5 rounded-full border flex items-center transition-colors font-medium
                            ${newEvent.reminders.includes(opt.val) 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-200'}
                          `}
                       >
                          {opt.label}
                       </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-200/50">
                    <button
                        type="button"
                        onClick={() => setNewEvent(prev => ({...prev, notifyEmail: !prev.notifyEmail}))}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
                            newEvent.notifyEmail 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        <Mail className={`w-4 h-4 ${newEvent.notifyEmail ? 'fill-emerald-200' : ''}`} />
                        <span className="text-sm font-medium">Enviar também por E-mail</span>
                    </button>
                    <p className="text-[10px] text-slate-400">
                        {newEvent.notifyEmail ? 'Um e-mail será enviado para sua conta.' : 'Notificações apenas no dispositivo.'}
                    </p>
                </div>
            </div>
        </div>

        <div className="md:col-span-2">
            <Input 
                label="Descrição / Notas (Opcional)" 
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
            />
        </div>

        <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar Evento</Button>
        </div>
      </form>
    </div>
  );
};
