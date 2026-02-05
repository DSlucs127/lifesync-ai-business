import React from 'react';
import { List, Kanban, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { Select } from '../Input';

interface TaskFiltersProps {
  viewMode: 'list' | 'kanban' | 'calendar';
  setViewMode: (mode: 'list' | 'kanban' | 'calendar') => void;
  filters: {
    status: string;
    priority: string;
    search: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ viewMode, setViewMode, filters, setFilters }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center mb-6">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto flex-1">
        <div className="relative flex-1 lg:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
                type="text" 
                placeholder="Buscar tarefas..."
                className="w-full pl-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                value={filters.search}
                onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
            />
        </div>
        
        <div className="flex gap-2">
            <select
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                value={filters.status}
                onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
            >
                <option value="all">Todas</option>
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="done">Concluídas</option>
            </select>

            <select
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                value={filters.priority}
                onChange={e => setFilters(prev => ({...prev, priority: e.target.value}))}
            >
                <option value="all">Prioridade: Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
            </select>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg w-full md:w-auto">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all flex items-center justify-center space-x-2 ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <List className="w-4 h-4" />
          <span className="text-xs font-medium">Lista</span>
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all flex items-center justify-center space-x-2 ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <Kanban className="w-4 h-4" />
          <span className="text-xs font-medium">Kanban</span>
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all flex items-center justify-center space-x-2 ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-xs font-medium">Agenda</span>
        </button>
      </div>
    </div>
  );
};