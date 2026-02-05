import React, { useState } from 'react';
import { Transaction, Category, Budget } from '../types';
import { Plus, Settings, List, Calendar as CalendarIcon, PieChart, Target, Download, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { TransactionForm } from './finance/TransactionForm';
import { TransactionList } from './finance/TransactionList';
import { FinanceFilters } from './finance/FinanceFilters';
import { CategoryManager } from './finance/CategoryManager';
import { FinanceCalendar } from './finance/FinanceCalendar';
import { FinanceCharts } from './finance/FinanceCharts';
import { BudgetManager } from './finance/BudgetManager';
import { EditTransactionModal } from './finance/EditTransactionModal';
import { FinancialAdvisor } from './finance/FinancialAdvisor';

interface FinanceProps {
  transactions: Transaction[];
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  budgets: Budget[];
  onUpdateBudget: (b: Omit<Budget, 'userId'>) => void;
  // Fix: Update prop signature to omit userId to match useAppData and TransactionForm
  onAddTransaction: (t: Omit<Transaction, 'id' | 'userId'>) => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  userId?: string;
}

type TabView = 'transactions' | 'calendar' | 'reports' | 'budgets';

export const Finance: React.FC<FinanceProps> = ({ 
    transactions, categories, setCategories, budgets, onUpdateBudget,
    onAddTransaction, onEditTransaction, onDeleteTransaction, userId = 'user_local_v1'
}) => {
  const [activeTab, setActiveTab] = useState<TabView>('transactions');
  const [isAdding, setIsAdding] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [filters, setFilters] = useState({
      search: '',
      category: 'all',
      type: 'all',
      startDate: '',
      endDate: ''
  });

  // Helper to add category from AI
  const handleAddCategory = (name: string) => {
    setCategories(prev => {
        if (prev.some(c => c.name.toLowerCase() === name.toLowerCase())) return prev;
        return [...prev, {
            id: Date.now().toString(),
            userId: userId,
            name: name,
            color: 'bg-slate-100 text-slate-800'
        }];
    });
  };

  const filteredTransactions = transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'all' || t.category === filters.category;
      const matchesType = filters.type === 'all' || t.type === filters.type;
      const matchesStart = !filters.startDate || t.date >= filters.startDate;
      const matchesEnd = !filters.endDate || t.date <= filters.endDate;
      return matchesSearch && matchesCategory && matchesType && matchesStart && matchesEnd;
  });

  const handleExportCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
            t.date.split('T')[0],
            `"${t.description}"`,
            t.category,
            t.type,
            t.amount.toFixed(2)
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'financas_lifesync.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFirstSetup = budgets.length === 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-24 md:pb-0 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Finanças</h2>
          <p className="text-slate-500 text-sm">Gerenciamento completo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {/* AI Button visible on all tabs */}
           <Button 
                onClick={() => setShowAdvisor(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 border-0 shadow-md"
           >
             <Sparkles className="w-4 h-4 mr-2 text-yellow-300 fill-yellow-300" />
             {isFirstSetup ? 'Organizar' : 'Revisar Metas'}
           </Button>

           <Button variant="secondary" onClick={handleExportCSV} title="Exportar CSV">
             <Download className="w-4 h-4" />
           </Button>
           <Button variant="secondary" onClick={() => setShowCatManager(true)}>
             <Settings className="w-4 h-4" />
           </Button>
           <Button onClick={() => setIsAdding(!isAdding)} variant="primary">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Nova Transação</span>
           </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {[
            { id: 'transactions', label: 'Transações', icon: List },
            { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
            { id: 'reports', label: 'Relatórios', icon: PieChart },
            { id: 'budgets', label: 'Metas', icon: Target },
        ].map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabView)}
                    className={`
                        flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                        ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                    `}
                >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                </button>
            )
        })}
      </div>

      {isAdding && (
        <TransactionForm 
            categories={categories} 
            onSubmit={(t) => { onAddTransaction(t); setIsAdding(false); }}
            onCancel={() => setIsAdding(false)}
        />
      )}

      {showCatManager && (
          <CategoryManager 
            categories={categories} 
            setCategories={setCategories} 
            onClose={() => setShowCatManager(false)} 
            userId={userId}
          />
      )}
      
      {showAdvisor && (
          <FinancialAdvisor 
             isOpen={showAdvisor}
             onClose={() => setShowAdvisor(false)}
             transactions={transactions}
             categories={categories}
             budgets={budgets}
             onUpdateBudget={onUpdateBudget}
             onAddCategory={handleAddCategory}
          />
      )}

      {editingTransaction && (
          <EditTransactionModal 
            transaction={editingTransaction}
            categories={categories}
            onSave={(t) => { onEditTransaction(t); setEditingTransaction(null); }}
            onCancel={() => setEditingTransaction(null)}
          />
      )}

      {activeTab === 'transactions' && (
          <>
            <FinanceFilters categories={categories} filters={filters} setFilters={setFilters} />
            <TransactionList 
                transactions={filteredTransactions} 
                onDelete={onDeleteTransaction} 
                onEdit={setEditingTransaction}
            />
          </>
      )}

      {activeTab === 'calendar' && (
          <FinanceCalendar transactions={filteredTransactions} />
      )}

      {activeTab === 'reports' && (
          <FinanceCharts transactions={transactions} />
      )}

      {activeTab === 'budgets' && (
          <BudgetManager 
            categories={categories} 
            transactions={transactions} 
            budgets={budgets} 
            onUpdateBudget={onUpdateBudget} 
            onAddCategory={handleAddCategory}
          />
      )}
    </div>
  );
};
