import React, { useState } from 'react';
import { Task } from '../../types';
import { Edit2, Trash2, Calendar, AlertCircle, CheckCircle2, Circle, ChevronDown, ChevronRight, ListTree } from 'lucide-react';
import { SubTaskView } from './SubTaskView';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onStatusChange }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  if (tasks.length === 0) {
      return <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">Nenhuma tarefa encontrada.</div>;
  }

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'high': return 'bg-red-100 text-red-700 border-red-200';
          case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const isOverdue = (task: Task) => {
      if (task.status === 'done' || !task.dueDate) return false;
      return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tarefa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prioridade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prazo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {tasks.map(task => {
                    const overdue = isOverdue(task);
                    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                    const isExpanded = expandedIds.has(task.id);
                    
                    // Calc progress
                    const completedSubs = task.subtasks?.filter(s => s.status === 'done').length || 0;
                    const totalSubs = task.subtasks?.length || 0;

                    return (
                        <React.Fragment key={task.id}>
                            <tr className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-700/30' : ''}`}>
                                <td className="px-2 py-4 whitespace-nowrap text-center">
                                    {hasSubtasks && (
                                        <button 
                                            onClick={() => toggleExpand(task.id)}
                                            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => onStatusChange(task, task.status === 'done' ? 'todo' : 'done')}
                                        className={`transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
                                    >
                                        {task.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                            {task.title}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            {hasSubtasks && (
                                                <div className="flex items-center text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full mt-1 w-fit">
                                                    <ListTree className="w-3 h-3 mr-1" />
                                                    {completedSubs}/{totalSubs}
                                                </div>
                                            )}
                                            {task.description && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-1">{task.description}</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`flex items-center text-sm ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {task.dueDate ? (
                                            <>
                                                {overdue && <AlertCircle className="w-4 h-4 mr-1" />}
                                                {!overdue && <Calendar className="w-4 h-4 mr-1 opacity-70" />}
                                                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                                <span className="text-xs ml-1 opacity-70">
                                                    {new Date(task.dueDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-slate-400 dark:text-slate-500 text-xs italic">Sem prazo</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(task)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete(task.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                            {/* Subtasks Render Area */}
                            {isExpanded && hasSubtasks && (
                                <tr>
                                    <td colSpan={6} className="px-0 py-0 border-b border-slate-100 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-700/10">
                                        <div className="pb-4 pr-4">
                                            <SubTaskView parentTask={task} onUpdateParent={onEdit} />
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};