import React from 'react';
import { LayoutList, Calendar as CalendarIcon, Grid } from 'lucide-react';
import { AGENDA_CATEGORIES } from '../../types';

interface AgendaFiltersProps {
  viewMode: 'list' | 'week' | 'month';
  setViewMode: (mode: 'list' | 'week' | 'month') => void;
  filterKind: 'all' | 'event' | 'routine';
  setFilterKind: (kind: 'all' | 'event' | 'routine') => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
}

export const AgendaFilters: React.FC<AgendaFiltersProps> = ({
  viewMode, setViewMode,
  filterKind, setFilterKind,
  filterCategory, setFilterCategory
}) => {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center mb-6">
      
      {/* View Mode Switcher - Compact on mobile */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 md:flex-none justify-center p-2 rounded-md transition-all flex items-center space-x-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          title="Lista"
        >
          <LayoutList className="w-4 h-4" />
          <span className="text-xs font-medium">Lista</span>
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 md:flex-none justify-center p-2 rounded-md transition-all flex items-center space-x-2 ${viewMode === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          title="Semana"
        >
          <Grid className="w-4 h-4" />
          <span className="text-xs font-medium">Semana</span>
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 md:flex-none justify-center p-2 rounded-md transition-all flex items-center space-x-2 ${viewMode === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          title="Mês"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-xs font-medium">Mês</span>
        </button>
      </div>

      {/* Data Filters - Side by side on mobile */}
      <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
        <select
          value={filterKind}
          onChange={(e) => setFilterKind(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 truncate"
        >
          <option value="all">Tipos: Todos</option>
          <option value="routine">Rotina</option>
          <option value="event">Eventos</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 truncate"
        >
          <option value="all">Cat: Todas</option>
          {AGENDA_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
};