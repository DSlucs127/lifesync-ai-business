import React, { useState } from 'react';
import { Task } from '../../types';
import { Plus, X, ListTree } from 'lucide-react';
import { Input, Select } from '../Input';
import { Button } from '../Button';

interface SubTaskManagerProps {
  subtasks: Task[];
  onChange: (subtasks: Task[]) => void;
}

export const SubTaskManager: React.FC<SubTaskManagerProps> = ({ subtasks, onChange }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAdd = () => {
    if (!newTitle.trim()) return;

    const newSubtask: Task = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'temp', // Will be handled by parent save if needed, or ignored for subtasks
      title: newTitle,
      status: 'todo',
      priority: newPriority,
      reminder: false
    };

    onChange([...subtasks, newSubtask]);
    setNewTitle('');
    setNewPriority('medium');
  };

  const handleRemove = (id: string) => {
    onChange(subtasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center space-x-2 text-slate-700 font-medium mb-2">
        <ListTree className="w-4 h-4" />
        <span>Subtarefas</span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
            <Input 
                placeholder="Título da subtarefa..." 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd();
                    }
                }}
            />
        </div>
        <div className="w-28">
            <Select 
                options={[
                    {value: 'low', label: 'Baixa'},
                    {value: 'medium', label: 'Média'},
                    {value: 'high', label: 'Alta'}
                ]}
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as any)}
            />
        </div>
        <Button type="button" onClick={handleAdd} disabled={!newTitle.trim()}>
            <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 mt-3">
        {subtasks.map(sub => (
          <div key={sub.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
             <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                    sub.priority === 'high' ? 'bg-red-500' : 
                    sub.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></span>
                <span className="text-sm text-slate-700">{sub.title}</span>
             </div>
             <button 
                type="button" 
                onClick={() => handleRemove(sub.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
             >
                <X className="w-4 h-4" />
             </button>
          </div>
        ))}
        {subtasks.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">Nenhuma subtarefa adicionada.</p>
        )}
      </div>
    </div>
  );
};