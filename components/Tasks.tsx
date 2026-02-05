import React, { useState } from 'react';
import { Task } from '../types';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import { TaskList } from './tasks/TaskList';
import { TaskKanban } from './tasks/TaskKanban';
import { TaskFilters } from './tasks/TaskFilters';
import { TaskForm } from './tasks/TaskForm';
import { AgendaCalendar } from './agenda/AgendaCalendar'; // Reusing Calendar Component
import { useAppData } from '../hooks/useAppData';

interface TasksProps {
  tasks: Task[];
  onAddTask: (t: Omit<Task, 'id' | 'userId'>) => void;
  onEditTask: (t: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({ tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [filters, setFilters] = useState({
      status: 'all',
      priority: 'all',
      search: ''
  });

  const filteredTasks = tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                            (t.description && t.description.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesStatus = filters.status === 'all' || t.status === filters.status;
      const matchesPriority = filters.priority === 'all' || t.priority === filters.priority;
      return matchesSearch && matchesStatus && matchesPriority;
  });

  // Adapter for Calendar View (Tasks -> CalendarEvent shape)
  const calendarEvents = filteredTasks
    .filter(t => t.dueDate || t.startDate)
    .map(t => ({
        id: t.id,
        userId: t.userId,
        date: t.startDate || t.dueDate || '',
        title: t.title,
        durationMinutes: 60,
        category: 'Tarefa',
        kind: 'event' as const,
        recurrence: 'none' as const
    }));

  return (
    <div className="space-y-6 animate-fadeIn pb-24 md:pb-0 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciador de Tarefas</h2>
          <p className="text-slate-500 text-sm">Organize suas prioridades e prazos.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <TaskFilters 
         viewMode={viewMode} 
         setViewMode={setViewMode} 
         filters={filters} 
         setFilters={setFilters} 
      />

      <div className="flex-1 min-h-0">
        {viewMode === 'list' && (
            <TaskList 
                tasks={filteredTasks} 
                onEdit={setEditingTask} 
                onDelete={onDeleteTask} 
                onStatusChange={(t, s) => onEditTask({...t, status: s})}
            />
        )}
        
        {viewMode === 'kanban' && (
            <TaskKanban 
                tasks={filteredTasks} 
                onEdit={setEditingTask} 
                onStatusChange={(t, s) => onEditTask({...t, status: s})}
            />
        )}

        {viewMode === 'calendar' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <AgendaCalendar events={calendarEvents} />
            </div>
        )}
      </div>

      {(isAdding || editingTask) && (
          <TaskForm 
            initialData={editingTask || undefined}
            onSave={(t) => {
                if (editingTask) {
                    onEditTask(t);
                    setEditingTask(null);
                } else {
                    onAddTask(t);
                    setIsAdding(false);
                }
            }}
            onCancel={() => {
                setIsAdding(false);
                setEditingTask(null);
            }}
          />
      )}
    </div>
  );
};