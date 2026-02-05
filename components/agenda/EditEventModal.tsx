import React, { useState } from 'react';
import { CalendarEvent, AGENDA_CATEGORIES } from '../../types';
import { Input, Select } from '../Input';
import { Button } from '../Button';
import { X } from 'lucide-react';

interface EditEventModalProps {
  event: CalendarEvent;
  onSave: (e: CalendarEvent) => void;
  onCancel: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ event, onSave, onCancel }) => {
  const [editEvent, setEditEvent] = useState({
    ...event,
    date: new Date(event.date).toISOString().slice(0, 16) // Format for datetime-local
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...editEvent,
      date: new Date(editEvent.date).toISOString(),
      durationMinutes: Number(editEvent.durationMinutes)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Editar Evento</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Título" 
            required
            value={editEvent.title}
            onChange={e => setEditEvent({...editEvent, title: e.target.value})}
          />
          <Input 
            label="Data e Hora" 
            type="datetime-local" 
            required
            value={editEvent.date}
            onChange={e => setEditEvent({...editEvent, date: e.target.value})}
          />
          
          <div className="grid grid-cols-2 gap-4">
              <Input 
              label="Duração (min)" 
              type="number" 
              required
              value={editEvent.durationMinutes}
              onChange={e => setEditEvent({...editEvent, durationMinutes: Number(e.target.value)})}
              />
              <Select 
                  label="Classificação"
                  options={[
                      {value: 'event', label: 'Evento Único'},
                      {value: 'routine', label: 'Rotina'}
                  ]}
                  value={editEvent.kind}
                  onChange={e => setEditEvent({...editEvent, kind: e.target.value as any})}
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
               <Select 
                label="Categoria"
                options={AGENDA_CATEGORIES.map(t => ({value: t, label: t}))}
                value={editEvent.category}
                onChange={e => setEditEvent({...editEvent, category: e.target.value})}
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
                value={editEvent.recurrence}
                onChange={e => setEditEvent({...editEvent, recurrence: e.target.value as any})}
              />
          </div>

          <div className="md:col-span-2">
              <Input 
                  label="Descrição (Opcional)" 
                  value={editEvent.description || ''}
                  onChange={e => setEditEvent({...editEvent, description: e.target.value})}
              />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-2 mt-4 border-t pt-4 border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};