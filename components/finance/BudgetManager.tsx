
import React, { useState } from 'react';
import { Transaction, Category, Budget } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { Edit2, Save, Sparkles } from 'lucide-react';
import { FinancialAdvisor } from './FinancialAdvisor';

interface BudgetManagerProps {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  // Fix: Update prop signature to omit userId
  onUpdateBudget: (budget: Omit<Budget, 'userId'>) => void;
  onAddCategory?: (name: string) => void; // New prop for AI integration
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ 
    categories, transactions, budgets, onUpdateBudget, onAddCategory 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');
  const [showAdvisor, setShowAdvisor] = useState(false);

  // Calculate current spending for this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getSpentAmount = (categoryName: string) => {
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === categoryName &&
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
      )
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const handleEdit = (categoryName: string, currentLimit: number) => {
    setEditingId(categoryName);
    setTempLimit(currentLimit.toString());
  };

  const handleSave = (categoryName: string) => {
    onUpdateBudget({ categoryId: categoryName, limit: parseFloat(tempLimit) || 0 });
    setEditingId(null);
  };

  const isFirstSetup = budgets.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
        <div>
            <h3 className="font-bold text-indigo-800">Metas Mensais</h3>
            <p className="text-sm text-indigo-600">Defina limites para suas categorias e acompanhe o progresso deste mês.</p>
        </div>
        <Button 
            onClick={() => setShowAdvisor(true)}
            className="bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm"
        >
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
            {isFirstSetup ? 'Organizar com IA' : 'Ajustar Metas com IA'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categories.map(cat => {
          const budget = budgets.find(b => b.categoryId === cat.name);
          const limit = budget ? budget.limit : 0;
          const spent = getSpentAmount(cat.name);
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          
          let colorClass = 'bg-emerald-500';
          if (percentage > 75) colorClass = 'bg-yellow-500';
          if (percentage >= 100) colorClass = 'bg-red-500';

          return (
            <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                </div>
                
                {editingId === cat.name ? (
                    <div className="flex items-center space-x-2">
                        <Input 
                            type="number" 
                            className="w-24 h-8 text-right" 
                            value={tempLimit} 
                            onChange={e => setTempLimit(e.target.value)} 
                            autoFocus
                        />
                        <Button size="sm" onClick={() => handleSave(cat.name)}>
                            <Save className="w-3 h-3" />
                        </Button>
                    </div>
                ) : (
                    <button onClick={() => handleEdit(cat.name, limit)} className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center">
                        <span className="mr-2">Meta: R$ {limit.toFixed(0)}</span>
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percentage}%` }}></div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>Gasto: R$ {spent.toFixed(2)}</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {showAdvisor && (
          <FinancialAdvisor 
             isOpen={showAdvisor}
             onClose={() => setShowAdvisor(false)}
             transactions={transactions}
             categories={categories}
             budgets={budgets}
             onUpdateBudget={onUpdateBudget}
             onAddCategory={onAddCategory || (() => {})}
          />
      )}
    </div>
  );
};
