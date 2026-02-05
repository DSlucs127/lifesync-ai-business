
import React, { useEffect, useState, useMemo } from 'react';
import { Transaction, CalendarEvent, Task, ViewState } from '../types';
import { generateDailyBriefing } from '../services/geminiService';
import { AdUnit } from './AdUnit';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    Calendar as CalendarIcon, 
    Loader2, 
    Sparkles, 
    Wallet, 
    TrendingUp,
    ArrowRight,
    CreditCard,
    Briefcase,
    Clock,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  events: CalendarEvent[];
  tasks: Task[];
  onViewChange?: (view: ViewState) => void;
  isWorkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, events, tasks, onViewChange, isWorkMode = false }) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [cachedDataVersion, setCachedDataVersion] = useState<string>('');

  const currentDataFingerprint = useMemo(() => {
      const eStr = events.map(e => `${e.id}-${e.date}`).join('|');
      const tStr = transactions.map(t => `${t.id}-${t.amount}`).join('|');
      const tkStr = tasks.map(tk => `${tk.id}-${tk.status}`).join('|');
      return `${eStr}::${tStr}::${tkStr}`;
  }, [events, transactions, tasks]);

  const hasDataChanged = briefing && cachedDataVersion !== currentDataFingerprint;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, isWorkMode ? 8 : 4);

  const chartData = Object.values(transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, curr) => {
      if (!acc[curr.category]) acc[curr.category] = { name: curr.category, value: 0 };
      acc[curr.category].value += curr.amount;
      return acc;
    }, {}))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  const generateBriefing = async () => {
      if (loadingBriefing) return;
      setLoadingBriefing(true);
      try {
          const res = await generateDailyBriefing(events);
          setBriefing(res);
          setCachedDataVersion(currentDataFingerprint);
          localStorage.setItem('lifesync_daily_briefing', JSON.stringify({
              date: new Date().toDateString(),
              text: res,
              version: currentDataFingerprint
          }));
      } catch (error) {
          console.error("Failed to generate briefing", error);
          if (!briefing) setBriefing("Tenha um ótimo dia! Organize suas tarefas.");
      } finally {
          setLoadingBriefing(false);
      }
  };

  useEffect(() => {
    const loadBriefing = () => {
        const todayStr = new Date().toDateString();
        const cached = localStorage.getItem('lifesync_daily_briefing');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                if (data.date === todayStr && data.text) {
                    setBriefing(data.text);
                    setCachedDataVersion(data.version || '');
                    return; 
                }
            } catch (e) {
                console.warn("Invalid briefing cache");
            }
        }
        if (events.length > 0 && !briefing) {
            generateBriefing();
        }
    };
    loadBriefing();
  }, [events.length]); 

  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const isToday = date.toDateString() === new Date().toDateString();
      if (isToday) return 'Hoje';
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 md:pb-0">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isWorkMode ? 'Painel de Trabalho' : 'Visão Geral'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
        
        <div className={`flex-1 md:max-w-2xl rounded-xl p-4 text-white shadow-lg relative overflow-hidden flex items-center transition-all duration-500 ${isWorkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500'}`}>
            <div className="mr-4 bg-white/20 p-2 rounded-full hidden sm:block">
                <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="relative z-10 flex-1">
                {loadingBriefing ? (
                    <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium">Atualizando briefing...</span>
                    </div>
                ) : (
                    <p className="text-sm font-medium leading-snug">
                        {briefing || (isWorkMode ? "Vamos focar nas prioridades do dia." : "Olá! Adicione eventos para receber seu briefing diário.")}
                    </p>
                )}
            </div>
            
            {hasDataChanged && (
                <div className="relative z-10 ml-3 border-l border-white/20 pl-3 animate-bounceIn">
                    <button 
                        onClick={generateBriefing}
                        disabled={loadingBriefing}
                        className="p-2 bg-white/10 hover:bg-white/30 rounded-lg transition-all group flex flex-col items-center gap-1"
                        title="Atualizar resumo"
                    >
                        <RefreshCw className={`w-4 h-4 text-white ${loadingBriefing ? 'animate-spin' : ''}`} />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">Atualizar</span>
                    </button>
                </div>
            )}
        </div>
      </header>

      <AdUnit slotId="dashboard-top" format="banner" />

      {/* WORK MODE VIEW */}
      {isWorkMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-slate-500" />
                            Agenda de Compromissos
                        </h3>
                        <button onClick={() => onViewChange?.('agenda')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
                            Ver Calendário
                        </button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        {upcomingEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <CalendarIcon className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-slate-500 text-sm">Agenda livre.</p>
                            </div>
                        ) : (
                            upcomingEvents.map((e) => (
                                <div key={e.id} className="flex gap-4 p-4 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl shadow-sm hover:border-slate-300 transition-all group">
                                    <div className="flex flex-col items-center justify-center min-w-[3.5rem] bg-slate-50 dark:bg-slate-600 rounded-lg h-14">
                                         <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-300">{new Date(e.date).toLocaleDateString('pt-BR', {weekday: 'short'}).replace('.','')}</span>
                                         <span className="text-lg font-bold text-slate-800 dark:text-white">{new Date(e.date).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{e.title}</h4>
                                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            <Clock className="w-4 h-4 mr-1.5" />
                                            {new Date(e.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            <span className="mx-2">•</span>
                                            {e.durationMinutes} min
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
               </div>

               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-slate-500" />
                            Tarefas Prioritárias
                        </h3>
                        <button onClick={() => onViewChange?.('tasks')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
                            Gerenciar Tarefas
                        </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-600">
                        <Briefcase className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Modo Foco Ativado</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-xs">Suas finanças estão ocultas. Use a aba "Tarefas" para gerenciar suas pendências de trabalho.</p>
                        <button onClick={() => onViewChange?.('tasks')} className="mt-4 px-4 py-2 bg-slate-800 dark:bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors">
                            Ir para Tarefas
                        </button>
                    </div>
               </div>
          </div>
      ) : (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white dark:bg-slate-800 p-3 md:p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 md:p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <Wallet className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">Total</span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white truncate">R$ {balance.toFixed(2)}</p>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Saldo disponível</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 md:p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 md:p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                        <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">Receitas</span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white truncate">R$ {totalIncome.toFixed(2)}</p>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Entradas do mês</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 md:p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 md:p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                        <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">Despesas</span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white truncate">R$ {totalExpense.toFixed(2)}</p>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Saídas do mês</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 md:p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">Economia</span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white truncate">{savingsRate.toFixed(1)}%</p>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Taxa de poupança</p>
                </div>
            </div>
            
            <AdUnit slotId="dashboard-mid" format="banner" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white">Top Despesas</h3>
                            <button onClick={() => onViewChange?.('finance')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center">
                                Detalhes <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        <div className="w-full" style={{ height: '192px', minHeight: '192px' }}>
                            {chartData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sem dados de despesas.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-slate-400" />
                                Últimas Transações
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {recentTransactions.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-4">Nenhuma atividade recente.</p>
                            ) : (
                                recentTransactions.map(t => (
                                    <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.description}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                            Agenda
                        </h3>
                        <button onClick={() => onViewChange?.('agenda')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
                            Ver tudo
                        </button>
                    </div>
                    
                    <div className="flex-1 space-y-4 relative">
                        {upcomingEvents.length > 0 && (
                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700"></div>
                        )}

                        {upcomingEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center">
                                <CalendarIcon className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-slate-400 text-sm">Agenda livre por enquanto.</p>
                            </div>
                        ) : (
                            upcomingEvents.map((e, idx) => (
                                <div key={e.id} className="relative pl-10 group">
                                    <div className="absolute left-3 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-800 group-hover:border-indigo-500 transition-colors z-10"></div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{e.title}</h4>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                                                {formatDate(e.date)}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-xs text-slate-500 dark:text-slate-400">
                                            <span>{new Date(e.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="mx-1">•</span>
                                            <span>{e.durationMinutes} min</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <AdUnit slotId="dashboard-sidebar-rect" format="rectangle" />
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};
