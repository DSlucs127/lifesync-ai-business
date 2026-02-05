
import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Calendar, X, Check, Trash2 } from 'lucide-react';
import { Transaction, CalendarEvent } from '../types';

interface NotificationsPopoverProps {
  transactions: Transaction[];
  events: CalendarEvent[];
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ transactions, events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
      const saved = localStorage.getItem('lifesync_dismissed_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Save dismissed IDs to local storage whenever it changes
  useEffect(() => {
      localStorage.setItem('lifesync_dismissed_notifications', JSON.stringify(Array.from(dismissedIds)));
  }, [dismissedIds]);

  const dismissNotification = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setDismissedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
      });
  };

  const clearAll = () => {
      const allIds = new Set(dismissedIds);
      // Logic would be to add all current displayed IDs to this set
      // For simplicity in this render cycle, we assume user wants to clear visual list
      // A robust implementation would iterate visible items.
      // Here we just force a refresh or similar, but with this prop structure, 
      // we need to track IDs.
      
      // Let's iterate current items to dismiss them
      const todayStr = new Date().toDateString();
      events.filter(e => new Date(e.date).toDateString() === todayStr).forEach(e => allIds.add(e.id));
      
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(new Date().getDate() + 3);
      transactions.filter(t => t.type === 'expense' && new Date(t.date) >= new Date() && new Date(t.date) <= threeDaysFromNow)
        .forEach(t => allIds.add(t.id));

      setDismissedIds(allIds);
  };

  // Logic: Events Today
  const today = new Date();
  const todayStr = today.toDateString();
  const eventsToday = events
    .filter(e => new Date(e.date).toDateString() === todayStr)
    .filter(e => !dismissedIds.has(e.id));

  // Logic: Bills due soon (Next 3 days)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  const upcomingBills = transactions
    .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= today && tDate <= threeDaysFromNow;
    })
    .filter(t => !dismissedIds.has(t.id));

  const totalCount = eventsToday.length + upcomingBills.length;

  return (
    <div className="relative z-40">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={totalCount > 0 ? `${totalCount} notificações não lidas` : "Notificações"}
        className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
      >
        <Bell className="w-6 h-6" />
        {totalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-slideDown ring-1 ring-black/5">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-800 dark:text-white">Notificações</h4>
                        {totalCount > 0 && <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full font-bold">{totalCount}</span>}
                    </div>
                    {totalCount > 0 && (
                        <button 
                            onClick={clearAll}
                            className="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 flex items-center transition-colors"
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Limpar
                        </button>
                    )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {totalCount === 0 ? (
                        <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                            <div className="bg-slate-100 dark:bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-8 h-8 opacity-40" />
                            </div>
                            <p className="text-sm">Você está em dia!</p>
                            <p className="text-xs opacity-70 mt-1">Nenhum alerta pendente.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {/* Events Section */}
                            {eventsToday.length > 0 && (
                                <div className="bg-indigo-50/30 dark:bg-indigo-900/10">
                                    <p className="px-4 py-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Agenda de Hoje</p>
                                    {eventsToday.map(e => (
                                        <div key={e.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-start group relative">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{e.title}</p>
                                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-100 dark:bg-slate-700 px-1.5 rounded ml-2">
                                                        {new Date(e.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{e.description || 'Evento agendado'}</p>
                                            </div>
                                            <button 
                                                onClick={(ev) => dismissNotification(e.id, ev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-600 rounded-full shadow-sm text-slate-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform scale-90 hover:scale-110"
                                                title="Marcar como lido"
                                                aria-label="Marcar como lido"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Financial Section */}
                            {upcomingBills.length > 0 && (
                                <div className="bg-red-50/30 dark:bg-red-900/10">
                                    <p className="px-4 py-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Contas Próximas</p>
                                    {upcomingBills.map(t => (
                                        <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-start group relative">
                                            <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{t.description}</p>
                                                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-1.5 rounded ml-2 whitespace-nowrap">
                                                        R$ {t.amount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Vence em: {new Date(t.date).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={(ev) => dismissNotification(t.id, ev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-600 rounded-full shadow-sm text-slate-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform scale-90 hover:scale-110"
                                                title="Marcar como visto"
                                                aria-label="Marcar como visto"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};
