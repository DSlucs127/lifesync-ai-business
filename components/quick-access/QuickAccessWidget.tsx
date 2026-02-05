
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, CalendarEvent, Task } from '../../types';
import { Activity, X, Wallet, Calendar, CheckSquare, GripHorizontal } from 'lucide-react';
import { QuickSummaryFinance } from './QuickSummaryFinance';
import { QuickSummaryAgenda } from './QuickSummaryAgenda';
import { QuickSummaryTasks } from './QuickSummaryTasks';

interface QuickAccessWidgetProps {
  transactions: Transaction[];
  events: CalendarEvent[];
  tasks: Task[];
}

type Tab = 'overview' | 'finance' | 'agenda' | 'tasks';

export const QuickAccessWidget: React.FC<QuickAccessWidgetProps> = ({ transactions, events, tasks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const stats = {
      pendingTasks: tasks.filter(t => t.status !== 'done').length,
      todayEvents: events.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length,
      currentBalance: transactions
        .filter(t => t.type === 'income').reduce((a,b) => a+b.amount,0) - 
        transactions
        .filter(t => t.type === 'expense').reduce((a,b) => a+b.amount,0)
  };

  return (
    <>
      {/* Trigger Button 
          - Mobile: Bottom-Left
          - Desktop: Bottom-Right (moved away from Sidebar to avoid overlap)
      */}
      <div className="fixed bottom-24 left-6 md:bottom-6 md:left-auto md:right-24 z-40 group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
                h-14 w-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300
                backdrop-blur-md border border-white/20
                ${isOpen 
                    ? 'bg-slate-800 text-white rotate-90 scale-90' 
                    : 'bg-white/80 text-indigo-600 hover:scale-105 hover:bg-white'}
            `}
            title="Acesso Rápido"
          >
             {isOpen ? <X className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
          </button>
          
          {/* Label Tooltip */}
          {!isOpen && (
            <span className="absolute left-16 md:left-auto md:right-16 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Resumo Rápido
            </span>
          )}
      </div>

      {/* Popup Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-end justify-start md:justify-end md:p-6 pointer-events-none">
            {/* Backdrop for mobile only */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm md:hidden pointer-events-auto" onClick={() => setIsOpen(false)}></div>

            <div 
                ref={modalRef}
                className="
                    pointer-events-auto
                    w-full md:w-[380px] 
                    bg-white/90 backdrop-blur-xl 
                    rounded-t-3xl md:rounded-3xl 
                    shadow-2xl border border-white/50
                    animate-slideUp
                    overflow-hidden
                    flex flex-col
                    max-h-[80vh]
                    md:mr-20 
                "
            >
                {/* Header with Tabs */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-2">
                    <div className="flex space-x-1">
                        {[
                            { id: 'overview', icon: GripHorizontal, label: 'Resumo' },
                            { id: 'tasks', icon: CheckSquare, label: stats.pendingTasks > 0 ? stats.pendingTasks : '' },
                            { id: 'finance', icon: Wallet, label: '' },
                            { id: 'agenda', icon: Calendar, label: stats.todayEvents > 0 ? stats.todayEvents : '' }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`
                                        flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all
                                        ${isActive 
                                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' 
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label && (
                                        <span className={`text-[10px] font-bold px-1.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {tab.label}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5 overflow-y-auto custom-scrollbar">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fadeIn">
                             <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Finanças</h3>
                                <QuickSummaryFinance transactions={transactions} />
                             </div>
                             <div className="h-px bg-slate-100"></div>
                             <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próximos Eventos</h3>
                                </div>
                                <QuickSummaryAgenda events={events} />
                             </div>
                             <div className="h-px bg-slate-100"></div>
                             <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Tarefas</h3>
                                </div>
                                <QuickSummaryTasks tasks={tasks} />
                             </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                         <div className="animate-fadeIn">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Panorama Financeiro</h3>
                            <QuickSummaryFinance transactions={transactions} />
                            {/* Can add more detailed charts here in future */}
                         </div>
                    )}

                    {activeTab === 'agenda' && (
                         <div className="animate-fadeIn">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Agenda Próxima</h3>
                            <QuickSummaryAgenda events={events} />
                         </div>
                    )}

                    {activeTab === 'tasks' && (
                         <div className="animate-fadeIn">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Tarefas Pendentes</h3>
                            <QuickSummaryTasks tasks={tasks} />
                         </div>
                    )}

                </div>
            </div>
        </div>
      )}
    </>
  );
};
