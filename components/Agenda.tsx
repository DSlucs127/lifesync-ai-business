
import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import { AgendaFilters } from './agenda/AgendaFilters';
import { AgendaList } from './agenda/AgendaList';
import { AgendaCalendar } from './agenda/AgendaCalendar';
import { AgendaWeek } from './agenda/AgendaWeek';
import { EventForm } from './agenda/EventForm';
import { EditEventModal } from './agenda/EditEventModal';

interface AgendaProps {
  events: CalendarEvent[];
  onAddEvent: (e: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  onEditEvent: (e: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

// Utility to expand recurring events into virtual instances
const expandRecurringEvents = (events: CalendarEvent[], startRange: Date, endRange: Date): CalendarEvent[] => {
    const expanded: CalendarEvent[] = [];
    
    events.forEach(event => {
        const eventStart = new Date(event.date);
        
        // If not recurring or recurrence is none, just check if it fits in range (roughly)
        if (!event.recurrence || event.recurrence === 'none') {
            if (eventStart >= startRange && eventStart <= endRange) {
                expanded.push(event);
            }
            return; // Skip logic below
        }

        // Handle Recurrence
        let currentInstance = new Date(eventStart);
        
        // Safety break to prevent infinite loops
        let count = 0;
        const maxInstances = 365; // Max 1 year of instances per event for performance

        while (currentInstance <= endRange && count < maxInstances) {
            if (currentInstance >= startRange) {
                // Create a virtual instance
                expanded.push({
                    ...event,
                    id: `${event.id}_${currentInstance.getTime()}`, // Virtual ID
                    date: currentInstance.toISOString(),
                    // Mark as virtual/instance if needed by UI
                });
            }

            // Advance date
            switch (event.recurrence) {
                case 'daily':
                    currentInstance.setDate(currentInstance.getDate() + 1);
                    break;
                case 'weekly':
                    currentInstance.setDate(currentInstance.getDate() + 7);
                    break;
                case 'monthly':
                    currentInstance.setMonth(currentInstance.getMonth() + 1);
                    break;
                case 'yearly':
                    currentInstance.setFullYear(currentInstance.getFullYear() + 1);
                    break;
                default:
                    currentInstance = new Date(endRange.getTime() + 1000); // Break loop
            }
            count++;
        }
    });

    return expanded;
};

export const Agenda: React.FC<AgendaProps> = ({ events, onAddEvent, onEditEvent, onDeleteEvent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'week' | 'month'>('list');
  const [filterKind, setFilterKind] = useState<'all' | 'event' | 'routine'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Compute Expanded Events
  const allEventsExpanded = useMemo(() => {
      const today = new Date();
      const startRange = new Date(today);
      startRange.setMonth(today.getMonth() - 6); // 6 months back
      const endRange = new Date(today);
      endRange.setMonth(today.getMonth() + 12); // 12 months forward
      
      return expandRecurringEvents(events, startRange, endRange);
  }, [events]);

  // Filter Logic on Expanded Events
  const filteredEvents = allEventsExpanded.filter(e => {
    // kind mapping personal->event, work->routine for compatibility with UI filters
    const mappedKind = e.kind === 'personal' || e.kind === 'event' ? 'event' : 'routine';
    const matchesKind = filterKind === 'all' || mappedKind === filterKind; 
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory || e.category === filterCategory.toLowerCase(); 
    return matchesKind && matchesCategory;
  });

  // Handle Delete: We must delete the *original* event ID.
  const handleDelete = (virtualId: string) => {
      const originalId = virtualId.split('_')[0];
      onDeleteEvent(originalId);
  };

  // Handle Edit: We usually edit the original series
  const handleEdit = (virtualEvent: CalendarEvent) => {
      // Find original event from source array
      const originalId = virtualEvent.id.split('_')[0];
      const originalEvent = events.find(e => e.id === originalId);
      if (originalEvent) {
          setEditingEvent(originalEvent);
      }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 md:pb-0 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Agenda Inteligente</h2>
          <p className="text-slate-500 text-sm">Organize sua rotina e eventos.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {isAdding && (
        <EventForm 
            onAddEvent={(e) => { onAddEvent(e); setIsAdding(false); }} 
            onCancel={() => setIsAdding(false)} 
        />
      )}

      {editingEvent && (
        <EditEventModal 
            event={editingEvent}
            onSave={(e) => { onEditEvent(e); setEditingEvent(null); }}
            onCancel={() => setEditingEvent(null)}
        />
      )}

      <AgendaFilters 
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterKind={filterKind}
        setFilterKind={setFilterKind}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />

      <div className="min-h-[400px]">
        {viewMode === 'list' && (
            <AgendaList events={filteredEvents} onDeleteEvent={handleDelete} onEditEvent={handleEdit} />
        )}
        {viewMode === 'month' && (
            <AgendaCalendar events={filteredEvents} />
        )}
        {viewMode === 'week' && (
            <AgendaWeek events={filteredEvents} />
        )}
      </div>
    </div>
  );
};
