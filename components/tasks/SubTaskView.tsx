import React from 'react';
import { Task } from '../../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface SubTaskViewProps {
  parentTask: Task;
  onUpdateParent: (updatedParent: Task) => void;
}

export const SubTaskView: React.FC<SubTaskViewProps> = ({ parentTask, onUpdateParent }) => {
  if (!parentTask.subtasks || parentTask.subtasks.length === 0) return null;

  const toggleSubtask = (subId: string) => {
    const updatedSubtasks = parentTask.subtasks!.map(sub => {
        if (sub.id === subId) {
            return { ...sub, status: sub.status === 'done' ? 'todo' : 'done' } as Task;
        }
        return sub;
    });

    // Optional: Auto-update parent status if all subtasks are done
    // const allDone = updatedSubtasks.every(s => s.status === 'done');
    
    onUpdateParent({
        ...parentTask,
        subtasks: updatedSubtasks,
        // status: allDone ? 'done' : parentTask.status // Uncomment for auto-completion logic
    });
  };

  return (
    <div className="mt-3 ml-12 space-y-2 relative">
      <div className="absolute left-[-23px] top-0 bottom-4 w-px bg-slate-200"></div>
      
      {parentTask.subtasks.map(sub => (
        <div key={sub.id} className="relative flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
            {/* Visual connector */}
            <div className="absolute left-[-23px] top-1/2 w-4 h-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSubtask(sub.id);
                    }}
                    className={`transition-colors ${sub.status === 'done' ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                >
                    {sub.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </button>
                <span className={`text-sm ${sub.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {sub.title}
                </span>
            </div>

            <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${
                    sub.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 
                    sub.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                    'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                    {sub.priority === 'high' ? 'Alta' : sub.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
            </div>
        </div>
      ))}
    </div>
  );
};