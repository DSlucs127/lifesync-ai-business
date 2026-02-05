
import React, { useState } from 'react';
import { Transaction, Category, Budget } from '../../types';
import { X, Sparkles, ChevronLeft } from 'lucide-react';
import { AdvisorForm, AdvisorFormData } from './advisor/AdvisorForm';
import { AdvisorChat } from './advisor/AdvisorChat';

interface FinancialAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  // Fix: Update prop signature to omit userId
  onUpdateBudget: (b: Omit<Budget, 'userId'>) => void;
  onAddCategory: (name: string) => void;
}

export const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({
  isOpen, onClose, transactions, categories, budgets, onUpdateBudget, onAddCategory
}) => {
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [formData, setFormData] = useState<AdvisorFormData | null>(null);

  const handleFormSubmit = (data: AdvisorFormData) => {
      setFormData(data);
      setStep('chat');
  };

  const reset = () => {
    setStep('form');
    setFormData(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm md:p-4 animate-fadeIn">
      {/* Modal Container: Fullscreen on mobile, centered card on desktop */}
      <div className="bg-white w-full h-full md:rounded-2xl md:shadow-2xl md:max-w-3xl md:h-[650px] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex justify-between items-center text-white shrink-0 shadow-md z-10 safe-top">
          <div className="flex items-center space-x-3">
             {step === 'chat' && (
                 <button onClick={reset} className="md:hidden p-1 hover:bg-white/20 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
             )}
             <div className="bg-white/20 p-2 rounded-full hidden md:block">
                <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight">Consultor Financeiro AI</h3>
                <p className="text-xs text-emerald-100 opacity-90 hidden md:block">Otimização inteligente de metas</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-slate-50 flex flex-col">
            {step === 'form' ? (
                <AdvisorForm onSubmit={handleFormSubmit} />
            ) : (
                formData && (
                    <AdvisorChat 
                        formData={formData}
                        transactions={transactions}
                        categories={categories}
                        budgets={budgets}
                        onUpdateBudget={onUpdateBudget}
                        onAddCategory={onAddCategory}
                    />
                )
            )}
        </div>
      </div>
    </div>
  );
};
