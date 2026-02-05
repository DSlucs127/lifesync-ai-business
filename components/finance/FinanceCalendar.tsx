import React from 'react';
import { Transaction } from '../../types';

interface FinanceCalendarProps {
  transactions: Transaction[];
}

export const FinanceCalendar: React.FC<FinanceCalendarProps> = ({ transactions }) => {
  // Simple current month view logic
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getDayData = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const daysTrans = transactions.filter(t => t.date.startsWith(dateStr));
    const total = daysTrans.reduce((acc, t) => t.type === 'expense' ? acc - t.amount : acc + t.amount, 0);
    return { transactions: daysTrans, total };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-slate-500 uppercase">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(i => <div key={`blank-${i}`} className="h-24 bg-slate-50 rounded-lg"></div>)}
        {days.map(day => {
          const { transactions, total } = getDayData(day);
          return (
            <div key={day} className="h-24 border border-slate-100 rounded-lg p-1 flex flex-col relative hover:border-indigo-300 transition-colors bg-white">
              <span className={`text-xs font-bold ${transactions.length > 0 ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
              {transactions.length > 0 && (
                <div className="mt-auto text-right">
                  <span className={`text-xs font-bold ${total >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {total >= 0 ? '+' : ''}{Math.round(total)}
                  </span>
                  <div className="flex flex-wrap gap-0.5 justify-end mt-1">
                     {transactions.slice(0, 3).map(t => (
                        <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                     ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};