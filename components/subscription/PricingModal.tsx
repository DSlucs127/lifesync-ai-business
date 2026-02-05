
import React, { useState } from 'react';
import { PlanTier, PLAN_CONFIGS } from '../../types';
import { Check, Star, Users, X, ShieldCheck, CreditCard, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';
import { Button } from '../Button';
import { TransparentCheckout } from './TransparentCheckout';
import { useAuth } from '../../context/AuthContext';

interface PricingModalProps {
  currentPlan: PlanTier;
  onClose: () => void;
  onUpgrade: (plan: PlanTier) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ currentPlan, onClose, onUpgrade }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'B2C' | 'B2B'>('B2C');
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const isDemoUser = user?.uid === 'demo-user';

  const benefits = {
    free: ['Gestão Financeira Básica', 'Agenda Simples', 'Anúncios Exibidos'],
    pro: ['Sem Anúncios', 'WhatsApp Sync', 'IA Gemini 2.5 Flash'],
    pro_plus: ['Tudo do Pro', 'Upload de Arquivos', 'IA Ilimitada'],
    business_solo: ['CRM Individual', '1 Canal WhatsApp', 'IA de Vendas'],
    sales_team: ['CRM Equipe (5 users)', '3 Canais WhatsApp', 'Disparo em Massa'],
    service_desk: ['Helpdesk Completo', 'IA Treinada com PDFs', 'SLA Automático']
  };

  const plansToShow = Object.entries(PLAN_CONFIGS)
    .filter(([_, config]) => config.type === tab)
    .filter(([key, _]) => ['free', 'pro', 'pro_plus', 'business_solo', 'sales_team', 'service_desk'].includes(key));

  const handlePlanSelection = (tier: PlanTier) => {
      if (isDemoUser) {
          // Demo Mode: Instant Switch Logic
          setIsSimulating(true);
          setTimeout(() => {
              onUpgrade(tier);
              setIsSimulating(false);
              onClose();
              alert(`[MODO DEMO] Plano alterado para ${PLAN_CONFIGS[tier].label}. Funcionalidades desbloqueadas!`);
          }, 800);
      } else {
          // Real User: Open Checkout
          setCheckoutPlan(tier);
      }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Info Panel (Sticky on Desktop) */}
        <div className="w-full md:w-80 bg-indigo-600 p-8 text-white flex flex-col shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="mb-auto relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                    <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </div>
                <h2 className="text-3xl font-black mb-4 leading-tight">Upgrade LifeSync</h2>
                <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
                    Desbloqueie o poder do Gemini 2.5 Flash, elimine anúncios e gerencie sua família ou empresa com ferramentas profissionais.
                </p>
                {isDemoUser && (
                    <div className="mt-6 bg-amber-400/20 border border-amber-400/50 p-4 rounded-xl">
                        <p className="text-xs font-bold text-amber-200 uppercase mb-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> Modo Demonstração
                        </p>
                        <p className="text-xs text-white">
                            Você pode alternar entre planos livremente para testar as funcionalidades bloqueadas (CRM, Equipe, etc).
                        </p>
                    </div>
                )}
            </div>
            
            <div className="mt-8 space-y-4 relative z-10">
                <div className="flex items-start space-x-3">
                    <div className="bg-white/10 p-1.5 rounded-lg mt-1"><Sparkles className="w-4 h-4" /></div>
                    <div>
                        <p className="text-sm font-bold">IA Ilimitada</p>
                        <p className="text-xs text-indigo-200">Sem filas ou limites de tokens.</p>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="bg-white/10 p-1.5 rounded-lg mt-1"><Users className="w-4 h-4" /></div>
                    <div>
                        <p className="text-sm font-bold">Colaboração</p>
                        <p className="text-xs text-indigo-200">Compartilhe com sua equipe.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            
            {checkoutPlan && !isDemoUser ? (
                /* CHECKOUT VIEW (Real Users Only) */
                <TransparentCheckout 
                    plan={checkoutPlan} 
                    onSuccess={(id) => { onUpgrade(checkoutPlan); onClose(); }} 
                    onCancel={() => setCheckoutPlan(null)} 
                />
            ) : (
                /* PRICING VIEW */
                <>
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                            <button 
                                onClick={() => setTab('B2C')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'B2C' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Pessoal
                            </button>
                            <button 
                                onClick={() => setTab('B2B')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'B2B' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Profissional
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
                        {isSimulating && (
                            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
                                    <p className="text-indigo-900 font-bold">Aplicando novo plano...</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {plansToShow.map(([key, config]) => {
                                const isCurrent = currentPlan === key;
                                const tier = key as PlanTier;
                                const items = benefits[tier as keyof typeof benefits] || [];

                                return (
                                    <div key={key} className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all bg-white group ${isCurrent ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-300 hover:shadow-xl'}`}>
                                        {isCurrent && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg border-2 border-white uppercase tracking-tighter">
                                                Plano Atual
                                            </div>
                                        )}
                                        
                                        <div className="mb-6">
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{config.label}</h3>
                                            <div className="mt-4 flex items-baseline">
                                                <span className="text-4xl font-black text-slate-900">R$ {config.price.toFixed(0)}</span>
                                                <span className="text-sm font-bold text-slate-400 ml-1">/mês</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-4 mb-8 flex-1">
                                            {items.map((item, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-slate-600 font-medium">
                                                    <div className="bg-indigo-50 p-1 rounded-full mr-3 mt-0.5"><Check className="w-3 h-3 text-indigo-600 stroke-[3]" /></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button 
                                            variant={isCurrent ? 'secondary' : 'primary'}
                                            onClick={() => !isCurrent && handlePlanSelection(tier)}
                                            disabled={isCurrent || isSimulating}
                                            className={`w-full justify-center py-4 text-base font-bold rounded-2xl transition-all shadow-md ${isCurrent ? 'opacity-50' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                                        >
                                            {isCurrent 
                                                ? 'Plano Ativo' 
                                                : isDemoUser 
                                                    ? 'Testar Plano (Demo)' 
                                                    : tier === 'free' 
                                                        ? 'Começar Grátis' 
                                                        : 'Assinar Agora'
                                            }
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
