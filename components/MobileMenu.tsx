
import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Wallet, Calendar, CheckSquare, GraduationCap, Users, LifeBuoy } from 'lucide-react';
import { useAppData } from '../hooks/useAppData';
import { PLAN_CONFIGS } from '../types';

interface MobileMenuProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isWorkMode: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ currentView, onChangeView, isWorkMode }) => {
  const { subscription } = useAppData();
  const currentPlan = subscription?.plan || 'free';
  const isBusinessPlan = PLAN_CONFIGS[currentPlan].type === 'B2B';

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, showInWork: true },
    { id: 'finance', label: 'Finanças', icon: Wallet, showInWork: false },
    { id: 'agenda', label: 'Agenda', icon: Calendar, showInWork: true },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, showInWork: true },
    { id: 'studies', label: 'Estudos', icon: GraduationCap, showInWork: false },
  ];

  if (isWorkMode) {
      menuItems.push(
        { id: 'crm', label: 'CRM', icon: Users, showInWork: true },
        { id: 'helpdesk', label: 'Suporte', icon: LifeBuoy, showInWork: true }
      );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-30 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-bottom overflow-x-auto no-scrollbar">
      {menuItems.filter(item => isWorkMode ? item.showInWork : true).map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as ViewState)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors min-w-[50px] ${
              isActive 
                ? (isWorkMode ? 'text-slate-800' : 'text-indigo-600') 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-full ${isActive ? (isWorkMode ? 'bg-slate-100' : 'bg-indigo-50') : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? (isWorkMode ? 'fill-slate-800/10' : 'fill-indigo-600/10') : ''}`} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
