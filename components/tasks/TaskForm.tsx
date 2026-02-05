import React, { useState } from 'react';
import { Task } from '../../types';
import { Input, Select } from '../Input';
import { Button } from '../Button';
import { X, Bell } from 'lucide-react';
import { SubTaskManager } from './SubTaskManager';

interface TaskFormProps {
  initialData?: Task;
  onSave: (task: any) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSave, onCancel }) => {
  const [task, setTask] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'todo',
    priority: initialData?.priority || 'medium',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
    reminder: initialData?.reminder || false,
    subtasks: initialData?.subtasks || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initialData,
      ...task,
      startDate: task.startDate ? new Date(task.startDate).toISOString() : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">{initialData ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Título" 
            required
            value={task.title}
            onChange={e => setTask({...task, title: e.target.value})}
            placeholder="O que precisa ser feito?"
          />

          <div className="grid grid-cols-2 gap-4">
              <Select 
                  label="Status"
                  options={[
                      {value: 'todo', label: 'A Fazer'},
                      {value: 'in_progress', label: 'Em Andamento'},
                      {value: 'done', label: 'Concluído'}
                  ]}
                  value={task.status}
                  onChange={e => setTask({...task, status: e.target.value as any})}
              />
              <Select 
                  label="Prioridade"
                  options={[
                      {value: 'low', label: 'Baixa'},
                      {value: 'medium', label: 'Média'},
                      {value: 'high', label: 'Alta'}
                  ]}
                  value={task.priority}
                  onChange={e => setTask({...task, priority: e.target.value as any})}
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Input 
                label="Início" 
                type="datetime-local" 
                value={task.startDate}
                onChange={e => setTask({...task, startDate: e.target.value})}
              />
             <Input 
                label="Prazo Final" 
                type="datetime-local" 
                value={task.dueDate}
                onChange={e => setTask({...task, dueDate: e.target.value})}
              />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
             <textarea 
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm resize-none h-24"
                value={task.description}
                onChange={e => setTask({...task, description: e.target.value})}
             ></textarea>
          </div>

          <SubTaskManager 
            subtasks={task.subtasks} 
            onChange={(newSubtasks) => setTask({...task, subtasks: newSubtasks})} 
          />

          <div className="flex items-center space-x-2">
             <button 
                type="button" 
                onClick={() => setTask(prev => ({...prev, reminder: !prev.reminder}))}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${task.reminder ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
             >
                <Bell className={`w-4 h-4 ${task.reminder ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                <span className="text-sm font-medium">Lembrete automático ao atrasar</span>
             </button>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">{initialData ? 'Salvar Alterações' : 'Criar Tarefa'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};