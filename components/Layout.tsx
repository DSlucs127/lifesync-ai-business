
import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileMenu } from './MobileMenu';
import { ViewState } from '../types';
import { Bot, Briefcase, Home, Settings as SettingsIcon } from 'lucide-react';
import { NotificationsPopover } from './NotificationsPopover';
import { QuickAccessWidget } from './quick-access/QuickAccessWidget';
import { useAppData } from '../hooks/useAppData';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
  isWorkMode: boolean;
  toggleWorkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children, isWorkMode, toggleWorkMode }) => {
  const { transactions, events, tasks } = useAppData();
  
  useNotifications(events);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden font-sans relative transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onChangeView={onChangeView}
        isWorkMode={isWorkMode}
        toggleWorkMode={toggleWorkMode}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between z-20 sticky top-0 shadow-sm shrink-0">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">LifeSync</span>
          </div>
          <div className="flex items-center gap-1">
             <button 
                onClick={toggleWorkMode}
                className={`p-2 rounded-full transition-all ${isWorkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
             >
                {isWorkMode ? <Briefcase className="w-5 h-5" /> : <Home className="w-5 h-5" />}
             </button>
             <NotificationsPopover transactions={transactions} events={events} />
             <button 
                onClick={() => onChangeView('settings')}
                className={`p-2 rounded-full transition-all ${currentView === 'settings' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
             >
                <SettingsIcon className="w-6 h-6" />
             </button>
          </div>
        </header>

        {/* Desktop Header / Top Bar Area */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 z-20">
             <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isWorkMode ? 'bg-slate-800 text-white' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'}`}>
                    {isWorkMode ? 'Modo Trabalho' : 'Modo Pessoal'}
                </span>
                {isWorkMode && <span className="text-xs text-slate-400">Finanças ocultas</span>}
             </div>
             <NotificationsPopover transactions={transactions} events={events} />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 md:pb-8 relative z-0">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {!isWorkMode && (
         <QuickAccessWidget transactions={transactions} events={events} tasks={tasks} />
      )}

      {/* Mobile Bottom Navigation - Not changed here as it's separate component */}
      <MobileMenu currentView={currentView} onChangeView={onChangeView} isWorkMode={isWorkMode} />
    </div>
  );
};
