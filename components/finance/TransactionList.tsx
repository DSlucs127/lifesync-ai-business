import React, { useState } from 'react';
import { Transaction } from '../../types';
import { Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (transactions.length === 0) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma transação encontrada com os filtros atuais.</p>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        
        {/* DESKTOP VIEW (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {sortedTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}R$ {t.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                            onClick={() => onEdit(t)}
                            className="text-slate-300 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Editar"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onDelete(t.id)}
                            className="text-slate-300 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Excluir"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW (Expandable List) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
            {sortedTransactions.map(t => {
                const isExpanded = expandedId === t.id;
                return (
                    <div key={t.id} className="bg-white dark:bg-slate-800 transition-all">
                        {/* Main Row (Always Visible) */}
                        <div 
                            onClick={() => toggleExpand(t.id)}
                            className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-slate-700"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-600`}>
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="text-[10px]">{new Date(t.date).getDate()}</span>
                                        <span className="text-[8px] uppercase">{new Date(t.date).toLocaleDateString('pt-BR', {month: 'short'}).replace('.','')}</span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate pr-2">{t.description}</p>
                                    {!isExpanded && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{t.category}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                    {t.type === 'income' ? '+' : '-'} {Math.abs(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-300 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-300 dark:text-slate-500" />}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="px-4 pb-4 pt-0 bg-slate-50/50 dark:bg-slate-700/30 border-t border-slate-50 dark:border-slate-700 animate-fadeIn">
                                <div className="flex justify-between items-center mt-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-sm">
                                        {t.category}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(t);
                                            }}
                                            className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            <span>Editar</span>
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(t.id);
                                            }}
                                            className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors border border-red-100 dark:border-red-800"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Excluir</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-right">
                                    Registrado em: {new Date(t.date).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

      </div>
  );
};