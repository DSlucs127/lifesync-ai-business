import React from 'react';
import { Task } from '../../types';
import { Edit2, MoreHorizontal, Clock, AlertCircle, ListTree } from 'lucide-react';

interface TaskKanbanProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
}

export const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onEdit, onStatusChange }) => {
  const columns: { id: Task['status'], label: string, color: string }[] = [
      { id: 'todo', label: 'A Fazer', color: 'bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' },
      { id: 'in_progress', label: 'Em Andamento', color: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/50' },
      { id: 'done', label: 'Concluído', color: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50' },
  ];

  const getPriorityBadge = (p: string) => {
      switch(p) {
          case 'high': return <span className="w-2 h-2 rounded-full bg-red-500"></span>;
          case 'medium': return <span className="w-2 h-2 rounded-full bg-yellow-500"></span>;
          case 'low': return <span className="w-2 h-2 rounded-full bg-blue-500"></span>;
          default: return null;
      }
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'done' || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
      {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
              <div key={col.id} className={`rounded-xl border ${col.color} p-4 flex flex-col h-fit min-h-[200px]`}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-700 dark:text-white">{col.label}</h3>
                      <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-600">
                          {colTasks.length}
                      </span>
                  </div>
                  
                  <div className="space-y-3">
                      {colTasks.map(task => {
                          const overdue = isOverdue(task);
                          const totalSub = task.subtasks?.length || 0;
                          const doneSub = task.subtasks?.filter(s => s.status === 'done').length || 0;

                          return (
                              <div 
                                key={task.id} 
                                className={`bg-white dark:bg-slate-700 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all group ${overdue ? 'border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-slate-100 dark:border-slate-600'}`}
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center space-x-2">
                                          {getPriorityBadge(task.priority)}
                                          <span className="text-xs font-medium text-slate-400 dark:text-slate-400 capitalize">{task.priority}</span>
                                      </div>
                                      <button onClick={() => onEdit(task)} className="text-slate-300 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                          <Edit2 className="w-3 h-3" />
                                      </button>
                                  </div>
                                  
                                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{task.title}</h4>
                                  
                                  <div className="flex flex-wrap gap-2 mt-3">
                                      {task.dueDate && (
                                          <div className={`flex items-center text-xs ${overdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                              {overdue ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                          </div>
                                      )}
                                      
                                      {totalSub > 0 && (
                                          <div className={`flex items-center text-xs px-1.5 py-0.5 rounded ${doneSub === totalSub ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                              <ListTree className="w-3 h-3 mr-1" />
                                              {doneSub}/{totalSub}
                                          </div>
                                      )}
                                  </div>

                                  {/* Quick Actions for Status Move (Simple implementation) */}
                                  <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-600 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                      {col.id !== 'todo' && (
                                          <button onClick={() => onStatusChange(task, 'todo')} className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                                              ← A Fazer
                                          </button>
                                      )}
                                      {col.id === 'todo' && (
                                          <button onClick={() => onStatusChange(task, 'in_progress')} className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 ml-auto">
                                              Em Andamento →
                                          </button>
                                      )}
                                      {col.id === 'in_progress' && (
                                          <button onClick={() => onStatusChange(task, 'done')} className="text-[10px] text-emerald-500 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                                              Concluir →
                                          </button>
                                      )}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          );
      })}
    </div>
  );
};