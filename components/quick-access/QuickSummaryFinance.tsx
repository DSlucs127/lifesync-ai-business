import React from 'react';
import { Transaction } from '../../types';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface QuickSummaryFinanceProps {
  transactions: Transaction[];
}

export const QuickSummaryFinance: React.FC<QuickSummaryFinanceProps> = ({ transactions }) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  // Gastos de hoje
  const today = new Date().toDateString();
  const spentToday = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider mb-1">Saldo Atual</p>
          <h3 className="text-2xl font-bold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <Wallet className="absolute right-3 bottom-3 text-white opacity-20 w-12 h-12" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 p-3 rounded-lg border border-white/50 shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
             <div className="p-1 bg-emerald-100 rounded text-emerald-600"><TrendingUp className="w-3 h-3" /></div>
             <span className="text-xs text-slate-500 font-medium">Entradas</span>
          </div>
          <p className="text-sm font-bold text-slate-700">R$ {income.toFixed(0)}</p>
        </div>
        <div className="bg-white/60 p-3 rounded-lg border border-white/50 shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
             <div className="p-1 bg-rose-100 rounded text-rose-600"><TrendingDown className="w-3 h-3" /></div>
             <span className="text-xs text-slate-500 font-medium">Saídas</span>
          </div>
          <p className="text-sm font-bold text-slate-700">R$ {expense.toFixed(0)}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-500">Gasto Hoje</span>
        <span className="text-sm font-bold text-rose-600">- R$ {spentToday.toFixed(2)}</span>
      </div>
    </div>
  );
};