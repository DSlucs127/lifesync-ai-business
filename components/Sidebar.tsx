
import React, { useState } from 'react';
import { ViewState, PLAN_CONFIGS } from '../types';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../hooks/useGamification';
import { useAppData } from '../hooks/useAppData';
import { UserLevelWidget } from './gamification/UserLevelWidget';
import { PricingModal } from './subscription/PricingModal';
import { LayoutDashboard, Wallet, Calendar, Bot, CheckSquare, LogOut, Briefcase, Home, GraduationCap, Crown, Users, LifeBuoy, Heart, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isWorkMode: boolean;
  toggleWorkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isWorkMode, toggleWorkMode }) => {
  const { logout, user } = useAuth();
  const { stats } = useGamification();
  const { subscription, updatePlan } = useAppData();
  const [showPricing, setShowPricing] = useState(false);

  const currentPlan = subscription?.plan || 'free';
  const planLabel = PLAN_CONFIGS[currentPlan].label;
  const isBusinessPlan = PLAN_CONFIGS[currentPlan].type === 'B2B';
  const hasFamilyAccess = PLAN_CONFIGS[currentPlan].hasFamily;

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, showInWork: true },
    { id: 'finance', label: 'Finanças', icon: Wallet, showInWork: false },
    { id: 'agenda', label: 'Agenda', icon: Calendar, showInWork: true },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, showInWork: true },
    { id: 'studies', label: 'Estudos', icon: GraduationCap, showInWork: false },
    { id: 'family', label: 'Família', icon: Heart, showInWork: false },
  ];

  if (isWorkMode) {
      menuItems.push(
          { id: 'crm', label: 'CRM / Vendas', icon: Users, showInWork: true },
          { id: 'helpdesk', label: 'Suporte', icon: LifeBuoy, showInWork: true }
      );
  }

  const handlePlanChange = (newPlan: any) => {
      updatePlan(newPlan);
      setShowPricing(false);
  };

  return (
    <>
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full relative z-30 transition-colors duration-300">
        <div className="flex items-center space-x-2 p-6 border-b border-slate-100 dark:border-slate-800 h-16 shrink-0">
            <Bot className={`w-8 h-8 ${isWorkMode ? 'text-slate-700 dark:text-slate-200' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span className={`text-xl font-bold bg-clip-text text-transparent ${isWorkMode ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'}`}>
              LifeSync
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 uppercase font-bold">{planLabel}</span>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <UserLevelWidget stats={stats} variant="sidebar" />

          {menuItems.filter(item => isWorkMode ? item.showInWork : true).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const activeClass = isWorkMode 
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' 
                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';

            const isLocked = (item.id === 'crm' || item.id === 'helpdesk') ? !isBusinessPlan : (item.id === 'family' ? !hasFamilyAccess : false);

            return (
              <button
                key={item.id}
                onClick={() => isLocked ? setShowPricing(true) : onChangeView(item.id as ViewState)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? activeClass
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                  ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? (isWorkMode ? 'text-slate-700 dark:text-white' : 'text-indigo-600 dark:text-indigo-400') : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                </div>
                {isLocked && <Crown className="w-3 h-3 text-amber-500" />}
              </button>
            );
          })}

          <button 
             onClick={() => setShowPricing(true)}
             className="w-full flex items-center space-x-3 px-4 py-3 mt-4 rounded-lg text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          >
             <Crown className="w-5 h-5" />
             <span>Upgrade de Plano</span>
          </button>
        </nav>
        
        {/* Footer Actions Container */}
        <div className="flex flex-col shrink-0 bg-white dark:bg-slate-900 z-20">
            <div className="px-4 py-2 border-t border-slate-50 dark:border-slate-800">
                <button
                    onClick={() => onChangeView('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'settings' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    <SettingsIcon className={`w-5 h-5 ${currentView === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span>Configurações</span>
                </button>
            </div>

            {/* Work Mode Toggle */}
            <div className="px-4 pb-2 pt-1">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Modo de Foco</span>
                    </div>
                    <button 
                        onClick={toggleWorkMode}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${isWorkMode ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                    >
                        <div className="flex items-center space-x-2">
                            {isWorkMode ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                            <span className="text-sm font-medium">{isWorkMode ? 'Trabalho' : 'Pessoal'}</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${isWorkMode ? 'bg-slate-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isWorkMode ? 'left-4.5' : 'left-0.5'}`} style={{left: isWorkMode ? '18px' : '2px'}}></div>
                        </div>
                    </button>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${isWorkMode ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{user?.displayName || 'Usuário'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{isWorkMode ? 'Focado' : 'Online'}</p>
                        </div>
                    </div>
                    <button onClick={() => logout()} className="text-slate-400 hover:text-red-500 transition-colors" title="Sair" aria-label="Sair">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </aside>
    {showPricing && (
        <PricingModal 
            currentPlan={currentPlan} 
            onClose={() => setShowPricing(false)} 
            onUpgrade={handlePlanChange} 
        />
    )}
    </>
  );
};
