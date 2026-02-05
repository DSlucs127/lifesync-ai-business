import React from 'react';
import { Category } from '../../types';
import { Input, Select } from '../Input';
import { Search } from 'lucide-react';

interface FinanceFiltersProps {
  categories: Category[];
  filters: {
    search: string;
    category: string;
    type: string;
    startDate: string;
    endDate: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const FinanceFilters: React.FC<FinanceFiltersProps> = ({ categories, filters, setFilters }) => {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
        <div className="col-span-2 lg:col-span-2 relative">
             <label className="block text-sm font-medium text-slate-700 mb-1">Pesquisar</label>
             <Search className="w-4 h-4 absolute left-3 bottom-3 text-slate-400" />
             <input 
                type="text"
                placeholder="Descrição..." 
                className="w-full pl-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                value={filters.search}
                onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
             />
        </div>
        <Select 
            label="Tipo"
            options={[
                {value: 'all', label: 'Todos'}, 
                {value: 'income', label: 'Receitas'}, 
                {value: 'expense', label: 'Despesas'}
            ]}
            value={filters.type}
            onChange={e => setFilters(prev => ({...prev, type: e.target.value}))}
        />
        <Select 
            label="Categoria"
            options={[{value: 'all', label: 'Todas'}, ...categories.map(c => ({value: c.name, label: c.name}))]}
            value={filters.category}
            onChange={e => setFilters(prev => ({...prev, category: e.target.value}))}
        />
        <Input 
            label="De"
            type="date"
            value={filters.startDate}
            onChange={e => setFilters(prev => ({...prev, startDate: e.target.value}))}
        />
        <Input 
            label="Até"
            type="date"
            value={filters.endDate}
            onChange={e => setFilters(prev => ({...prev, endDate: e.target.value}))}
        />
    </div>
  );
};