
import React from 'react';
import { Transaction } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface FinanceChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');

  // Data for Pie Chart (Expenses by Category)
  const categoryData = Object.values(expenses.reduce((acc: any, curr) => {
    if (!acc[curr.category]) acc[curr.category] = { name: curr.category, value: 0 };
    acc[curr.category].value += curr.amount;
    return acc;
  }, {}));

  // Data for Bar Chart (Monthly Activity)
  const monthlyData = Object.values(transactions.reduce((acc: any, curr) => {
    const month = new Date(curr.date).toLocaleDateString('pt-BR', { month: 'short' });
    if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 };
    if (curr.type === 'income') acc[month].income += curr.amount;
    else acc[month].expense += curr.amount;
    return acc;
  }, {}));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Despesas por Categoria</h3>
        {/* Added minHeight and explicit style to prevent Recharts calculation errors */}
        <div className="w-full" style={{ height: '256px', minHeight: '256px' }}>
          {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
          ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Sem dados suficientes</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Fluxo Mensal</h3>
        {/* Added minHeight and explicit style to prevent Recharts calculation errors */}
        <div className="w-full" style={{ height: '256px', minHeight: '256px' }}>
            {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                    <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Sem dados suficientes</div>
            )}
        </div>
      </div>
    </div>
  );
};
