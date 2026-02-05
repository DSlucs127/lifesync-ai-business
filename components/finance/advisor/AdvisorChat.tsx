
import React, { useState, useRef, useEffect } from 'react';
import { AdvisorFormData } from './AdvisorForm';
import { AdvisorContext, consultFinancialAdvisor } from '../../../services/financeAIService';
import { Transaction, Category, Budget, ChatMessage } from '../../../types';
import { Button } from '../../Button';
import { Send, Loader2, Sparkles, UserCog, Calculator } from 'lucide-react';

interface AdvisorChatProps {
  formData: AdvisorFormData;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  // Fix: Update prop signature to omit userId
  onUpdateBudget: (b: Omit<Budget, 'userId'>) => void;
  onAddCategory: (name: string) => void;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  formData, transactions, categories, budgets, onUpdateBudget, onAddCategory
}) => {
  const [mode, setMode] = useState<'standard' | 'custom' | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mode]);

  const addMessage = (role: 'user' | 'model', text: string) => {
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role,
          text,
          timestamp: Date.now()
      }]);
  };

  const initChat = async (selectedMode: 'standard' | 'custom') => {
      setMode(selectedMode);
      setIsLoading(true);

      const context: AdvisorContext = {
          transactions,
          categories,
          budgets,
          userProfile: {
              income: Number(formData.income),
              goal: formData.goal,
              housingType: formData.housingType,
              housingCost: Number(formData.housingCost) || 0,
              vehicleStatus: formData.vehicleStatus,
              vehicleCost: Number(formData.vehicleCost) || 0
          },
          mode: selectedMode
      };

      const initialPrompt = selectedMode === 'standard' 
        ? "Analise meus dados e gere um plano financeiro padronizado e otimizado agora." 
        : "Analise meus dados. Quero um plano personalizado, pode me fazer perguntas para entender melhor minha rotina antes de definir as metas.";

      try {
          const response = await consultFinancialAdvisor(initialPrompt, context, []); // Empty history for start
          if (response && response.candidates && response.candidates[0]) {
              processResponse(response.candidates[0]);
          }
      } catch (e) {
          addMessage('model', 'Erro ao iniciar. Tente novamente.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!inputValue.trim() || isLoading || !mode) return;

      const userText = inputValue;
      setInputValue('');
      addMessage('user', userText);
      setIsLoading(true);

      try {
          const history = messages.map(m => ({
              role: m.role,
              parts: [{ text: m.text }]
          }));

           const context: AdvisorContext = {
              transactions, categories, budgets,
              userProfile: {
                  income: Number(formData.income),
                  goal: formData.goal,
                  housingType: formData.housingType,
                  housingCost: Number(formData.housingCost) || 0,
                  vehicleStatus: formData.vehicleStatus,
                  vehicleCost: Number(formData.vehicleCost) || 0
              },
              mode
          };

          const response = await consultFinancialAdvisor(userText, context, history);

          if (response && response.candidates && response.candidates[0]) {
              processResponse(response.candidates[0]);
          }
      } catch (e) {
          addMessage('model', 'Erro de comunicação.');
      } finally {
          setIsLoading(false);
      }
  };

  const processResponse = (candidate: any) => {
      const parts = candidate.content.parts || [];
      let textResponse = '';
      let toolExecuted = false;

      // Handle Text
      textResponse = parts.filter((p: any) => p.text).map((p: any) => p.text).join('');

      // Handle Tools
      const toolCalls = parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
      
      toolCalls.forEach((call: any) => {
          if (call.name === 'setBudget') {
              const args = call.args;
              // Fix: call onUpdateBudget with correct payload
              onUpdateBudget({ categoryId: args.categoryName, limit: Number(args.limitAmount) });
              textResponse += `\n\n✅ Meta: ${args.categoryName} -> R$ ${args.limitAmount}`;
              toolExecuted = true;
          } else if (call.name === 'createCategory') {
              const args = call.args;
              onAddCategory(args.name);
              textResponse += `\n\n✅ Nova Categoria: ${args.name}`;
              toolExecuted = true;
          }
      });

      if (!textResponse && toolExecuted) textResponse = "Ajustes realizados com sucesso.";
      addMessage('model', textResponse);
  };

  if (!mode) {
      return (
          <div className="flex flex-col h-full p-4 md:p-6 items-center justify-center space-y-6 md:space-y-8 animate-fadeIn bg-slate-50 dark:bg-slate-900 overflow-y-auto">
              <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">Como você prefere prosseguir?</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">Escolha como a IA deve estruturar suas metas.</p>
              </div>

              <div className="w-full max-w-sm space-y-4">
                  <button 
                    onClick={() => initChat('standard')}
                    className="w-full bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-start space-x-4 group active:scale-[0.98]"
                  >
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                          <Calculator className="w-6 h-6" />
                      </div>
                      <div>
                          <span className="block font-bold text-slate-800 dark:text-white text-lg mb-1">Padronizado</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 leading-tight">Gere um plano rápido baseado no seu perfil e regras de mercado (ex: 50/30/20).</span>
                      </div>
                  </button>

                  <button 
                    onClick={() => initChat('custom')}
                    className="w-full bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all text-left flex items-start space-x-4 group active:scale-[0.98]"
                  >
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                          <UserCog className="w-6 h-6" />
                      </div>
                      <div>
                          <span className="block font-bold text-slate-800 dark:text-white text-lg mb-1">Personalizado</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 leading-tight">Converse com a IA para ajustar detalhes finos e criar um plano sob medida.</span>
                      </div>
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] md:max-w-[85%] p-3.5 rounded-2xl text-sm md:text-base whitespace-pre-wrap shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Processando plano...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0 z-20 shadow-[0_-4px_6_px_-1px_rgba(0,0,0,0.05)]">
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                    type="text"
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-base md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-all"
                    placeholder="Responda ou peça ajustes..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    disabled={isLoading}
                />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl w-12 flex items-center justify-center p-0 shrink-0" disabled={isLoading}>
                    <Send className="w-5 h-5 text-white" />
                </Button>
            </form>
        </div>
    </div>
  );
};
