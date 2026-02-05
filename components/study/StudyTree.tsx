
import React from 'react';
import { StudyNode } from '../../types';
import { Check, Lock, Star, Play } from 'lucide-react';

interface StudyTreeProps {
  nodes: StudyNode[];
  onNodeClick: (node: StudyNode) => void;
}

export const StudyTree: React.FC<StudyTreeProps> = ({ nodes, onNodeClick }) => {
  return (
    <div className="flex flex-col items-center py-8 space-y-4 relative w-full max-w-md mx-auto">
      {/* Visual connection line running behind nodes */}
      <div className="absolute top-12 bottom-12 left-1/2 w-2 bg-slate-100 -translate-x-1/2 rounded-full -z-10"></div>

      {nodes.sort((a,b) => a.position - b.position).map((node, index) => {
        // Snake Layout Logic (Left / Center / Right)
        // Even indices: Center or offset left. Odd: Offset right.
        const offsetClass = index % 2 === 0 ? '-translate-x-0' : (index % 4 === 1 ? 'translate-x-8' : '-translate-x-8');
        
        let statusColor = 'bg-slate-200 border-slate-300 text-slate-400'; // Locked
        let icon = <Lock className="w-6 h-6" />;
        let cursor = 'cursor-not-allowed';

        if (node.status === 'completed') {
            statusColor = 'bg-amber-400 border-amber-500 text-white shadow-[0_4px_0_rgb(217,119,6)]';
            icon = <Check className="w-8 h-8 stroke-[3]" />;
            cursor = 'cursor-pointer';
        } else if (node.status === 'unlocked') {
            statusColor = 'bg-indigo-500 border-indigo-600 text-white shadow-[0_4px_0_rgb(79,70,229)] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all';
            icon = <Play className="w-8 h-8 fill-white" />;
            cursor = 'cursor-pointer';
        }

        return (
          <div key={node.id} className={`relative flex flex-col items-center z-10 ${offsetClass}`}>
             {/* Node Circle Button */}
             <button
                disabled={node.status === 'locked'}
                onClick={() => onNodeClick(node)}
                className={`
                    w-20 h-20 rounded-full border-b-4 flex items-center justify-center 
                    transition-transform duration-200 ${statusColor} ${cursor}
                `}
             >
                {icon}
                {/* Stars/Particles for completed nodes could go here */}
                {node.status === 'completed' && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
                        <Star className="w-3 h-3 fill-yellow-100 text-yellow-600" />
                    </div>
                )}
             </button>
             
             {/* Tooltip Label */}
             <div className="mt-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-center max-w-[150px]">
                <p className="text-xs font-bold text-slate-700 leading-tight">{node.title}</p>
             </div>
          </div>
        );
      })}
    </div>
  );
};
