import React from 'react';
import { Task } from '../../types';
import { CheckCircle2, AlertCircle, Circle } from 'lucide-react';

interface QuickSummaryTasksProps {
  tasks: Task[];
}

export const QuickSummaryTasks: React.FC<QuickSummaryTasksProps> = ({ tasks }) => {
  const pendingTasks = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
        // High priority first
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
    })
    .slice(0, 4);

  if (pendingTasks.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-xs">Tudo feito!</span>
        </div>
    );
  }

  return (
    <div className="space-y-2">
      {pendingTasks.map(task => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
        
        return (
          <div key={task.id} className="flex items-center justify-between p-2.5 bg-white/60 rounded-lg border border-white/50 shadow-sm hover:bg-white transition-colors">
            <div className="flex items-center space-x-3 min-w-0">
               <div className={`
                    w-1.5 h-1.5 rounded-full flex-shrink-0
                    ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-400'}
               `}></div>
               <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-medium text-slate-700 truncate ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                      {task.title}
                  </span>
                  {task.dueDate && (
                      <span className={`text-[10px] flex items-center ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          {isOverdue && <AlertCircle className="w-3 h-3 mr-1" />}
                          {new Date(task.dueDate).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}
                      </span>
                  )}
               </div>
            </div>
            
            <Circle className="w-4 h-4 text-slate-300" />
          </div>
        );
      })}
    </div>
  );
};