
import React, { useState } from 'react';
import { Lead } from '../../types';
import { Plus, MessageCircle, MoreHorizontal, Filter, Search, TrendingUp, Sparkles, Loader2, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { Button } from '../Button';
import { useAppData } from '../../hooks/useAppData';
import { WhatsAppConnect } from './WhatsAppConnect';
import { analyzeLead } from '../../services/geminiService';

export const CRMBoard: React.FC = () => {
  const { leads, addLead, updateLead } = useAppData();
  const [showQrModal, setShowQrModal] = useState(false);
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns: { id: Lead['status'], label: string, bg: string, text: string, border: string }[] = [
      { id: 'new', label: 'Novos Leads', bg: 'bg-blue-50/50', text: 'text-blue-700', border: 'border-blue-200' },
      { id: 'contacted', label: 'Em Contato', bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-200' },
      { id: 'proposal', label: 'Proposta Enviada', bg: 'bg-indigo-50/50', text: 'text-indigo-700', border: 'border-indigo-200' },
      { id: 'negotiation', label: 'Negociação', bg: 'bg-purple-50/50', text: 'text-purple-700', border: 'border-purple-200' },
      { id: 'closed_won', label: 'Fechado Ganho', bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ];

  const handleAnalyze = async (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnalyzingLeadId(lead.id);
    try {
        const res = await analyzeLead(lead);
        updateLead({ ...lead, aiAnalysis: res });
    } catch (err) {
        console.error("AI Error", err);
    } finally {
        setAnalyzingLeadId(null);
    }
  };

  const handleCreateLead = () => {
      const company = prompt("Nome da Empresa:");
      if (!company) return;
      addLead({
          name: "Novo Contato",
          company,
          value: 0,
          status: 'new',
          assignedTo: 'me'
      });
  };

  // Filter leads
  const filteredLeads = leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = leads.reduce((acc, lead) => acc + (lead.value || 0), 0);
  const winRate = leads.filter(l => l.status === 'closed_won').length / (leads.length || 1) * 100;

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn pb-12">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                    <Briefcase className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Pipeline de Vendas
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seu funil e converta leads em clientes.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar leads ou empresas..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="secondary" onClick={() => setShowQrModal(true)} className="hidden md:flex">
                    <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" /> Conectar WhatsApp
                </Button>
                <Button onClick={handleCreateLead} className="whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" /> Novo Lead
                </Button>
            </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor em Pipeline</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <DollarSign className="w-5 h-5" />
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads Ativos</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{leads.length}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <Filter className="w-5 h-5" />
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Conversão</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{winRate.toFixed(1)}%</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Previsão (IA)</p>
                    <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">+12%</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-5 h-5" />
                </div>
            </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-6 min-w-[1400px] h-full px-1">
                {columns.map(col => {
                    const colLeads = filteredLeads.filter(l => l.status === col.id);
                    return (
                        <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 h-full max-h-full">
                            {/* Column Header */}
                            <div className={`p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-2xl ${col.bg} dark:bg-transparent`}>
                                <h3 className={`font-bold text-sm ${col.text} dark:text-slate-200`}>{col.label}</h3>
                                <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm text-slate-600 dark:text-slate-300 border dark:border-slate-600">
                                    {colLeads.length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                {colLeads.map(lead => (
                                    <div 
                                        key={lead.id} 
                                        className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group cursor-pointer relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                {lead.company}
                                            </span>
                                            <button className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-200">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1 truncate">{lead.name}</h4>
                                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-3">
                                            {lead.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>

                                        {lead.aiAnalysis && (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg text-[10px] text-indigo-700 dark:text-indigo-300 mb-3 leading-relaxed border border-indigo-100 dark:border-indigo-800">
                                                <Sparkles className="w-3 h-3 inline mr-1" />
                                                {lead.aiAnalysis.slice(0, 80)}...
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-600">
                                            <div className="flex items-center text-xs text-slate-400">
                                                <Calendar className="w-3 h-3 mr-1" /> 2d
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => handleAnalyze(lead, e)}
                                                    className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                                                    title="Análise IA"
                                                >
                                                    {analyzingLeadId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                </button>
                                                <button className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {showQrModal && <WhatsAppConnect onClose={() => setShowQrModal(false)} />}
    </div>
  );
};
