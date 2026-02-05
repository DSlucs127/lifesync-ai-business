
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../hooks/useAppData';
import { PLAN_CONFIGS, PlanTier } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { AdminPanel } from './AdminPanel';
import { PricingModal } from '../subscription/PricingModal';
import { 
    User, CreditCard, Users, Building2, Shield, Bell, Lock, 
    ChevronRight, Crown, Mail, CheckCircle2, Loader2, Key, 
    Zap, CreditCard as CardIcon, Receipt, Smartphone, 
    History, ExternalLink, ToggleLeft, ToggleRight, Moon, Sun, Monitor
} from 'lucide-react';

type SettingsTab = 'profile' | 'subscription' | 'family' | 'organization' | 'notifications' | 'security';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { 
      subscription, 
      family, 
      userProfile, 
      updateProfile, 
      organizationMembers, 
      inviteOrgMember, 
      updateMemberRole, 
      updateMemberPermissions, 
      removeOrgMember,
      updatePlan 
  } = useAppData();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [notifEmail, setNotifEmail] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setNotifEmail(userProfile.notificationEmail || userProfile.email || '');
    }
  }, [userProfile]);

  const currentPlanKey = (subscription?.plan || 'free') as PlanTier;
  const planInfo = PLAN_CONFIGS[currentPlanKey];
  const isBusiness = planInfo.type === 'B2B';
  const hasFamily = planInfo.hasFamily;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateProfile({ 
        displayName, 
        notificationEmail: notifEmail 
    });
    setIsSaving(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
      // 1. Aplicação Imediata no DOM (Crucial para feedback instantâneo e Modo Demo)
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      let effectiveTheme = theme;
      if (theme === 'system') {
          effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.classList.add(effectiveTheme);
      
      // 2. Persistência Local
      localStorage.setItem('lifesync_theme', theme);

      // 3. Atualização do Perfil (Backend/State)
      const currentPrefs = userProfile?.preferences || {
          theme: 'system',
          dailyEmail: true,
          pushNotifications: true,
          monthlyReports: false,
          aiSuggestions: true
      };
      
      const newPrefs = { ...currentPrefs, theme };
      await updateProfile({ preferences: newPrefs as any });
  };

  const togglePreference = async (key: string) => {
    const currentPrefs = userProfile?.preferences || {
        theme: 'system',
        dailyEmail: true,
        pushNotifications: true,
        monthlyReports: false,
        aiSuggestions: true
    };

    const newPrefs = { 
        ...currentPrefs, 
        [key]: !((currentPrefs as any)[key]) 
    };
    await updateProfile({ preferences: newPrefs as any });
  };

  const menuItems: { id: SettingsTab; label: string; icon: any; show: boolean }[] = [
    { id: 'profile', label: 'Meu Perfil', icon: User, show: true },
    { id: 'subscription', label: 'Assinatura', icon: CreditCard, show: true },
    { id: 'security', label: 'Segurança', icon: Shield, show: true },
    { id: 'family', label: 'Família', icon: Users, show: hasFamily },
    { id: 'organization', label: 'Organização', icon: Building2, show: isBusiness },
    { id: 'notifications', label: 'Notificações', icon: Bell, show: true },
  ];

  // Fallback para exibir o estado correto no botão mesmo antes do updateProfile propagar
  const currentTheme = userProfile?.preferences?.theme || localStorage.getItem('lifesync_theme') || 'system';

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn pb-24 lg:pb-0">
      {/* Lateral Menu */}
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 hidden lg:block">Configurações</h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-2">
          {menuItems.filter(item => item.show).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[650px] flex flex-col relative">
        {showSavedToast && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideDown flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Alterações salvas!
            </div>
        )}

        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie suas informações e preferências do LifeSync.</p>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-3xl font-bold border-4 border-white dark:border-slate-600 shadow-md">
                  {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white">{displayName || 'Seu Nome'}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1 uppercase tracking-wider">Membro {planInfo.label}</p>
                </div>
                <Button variant="secondary" size="sm" className="hidden md:flex">Alterar Avatar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Nome de Exibição" 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)}
                />
                <Input 
                    label="E-mail de Notificações" 
                    value={notifEmail} 
                    onChange={e => setNotifEmail(e.target.value)}
                    placeholder="E-mail para alertas"
                />
                
                {/* THEME SELECTOR */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tema da Interface</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                currentTheme === 'light' 
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-white shadow-sm' 
                                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-500'
                            }`}
                        >
                            <Sun className="w-5 h-5 mr-2" /> Claro
                        </button>
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                currentTheme === 'dark' 
                                ? 'border-indigo-500 bg-slate-800 text-white shadow-sm' 
                                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-500'
                            }`}
                        >
                            <Moon className="w-5 h-5 mr-2" /> Escuro
                        </button>
                        <button
                            onClick={() => handleThemeChange('system')}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                currentTheme === 'system' 
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-white shadow-sm' 
                                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-500'
                            }`}
                        >
                            <Monitor className="w-5 h-5 mr-2" /> Sistema
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Idioma da Interface</label>
                    <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-indigo-500 focus:outline-none">
                        <option>Português (Brasil)</option>
                        <option>English</option>
                        <option>Español</option>
                    </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="max-w-3xl space-y-8 animate-fadeIn">
              {/* Active Plan Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                 <Crown className="absolute -right-8 -top-8 w-48 h-48 text-white opacity-5 rotate-12" />
                 <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-indigo-400/30">Plano Atual</span>
                            <h4 className="text-3xl font-black mt-2">{planInfo.label}</h4>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-indigo-200 opacity-80">Próximo vencimento</p>
                            <p className="font-bold text-lg">12 Out, 2025</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row items-end md:items-center justify-between gap-4 pt-8 border-t border-white/10">
                        <div>
                            <p className="text-sm text-indigo-200 mb-1">Valor Mensal</p>
                            <p className="text-2xl font-bold">R$ {planInfo.price.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button className="bg-white text-slate-900 hover:bg-slate-100 flex-1 md:flex-none" onClick={() => setShowPricing(true)}>
                                <Zap className="w-4 h-4 mr-2" /> Upgrade
                            </Button>
                            <Button variant="ghost" className="text-white hover:bg-white/10 flex-1 md:flex-none">Cancelar</Button>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Usage Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-800 dark:text-white flex items-center"><Users className="w-4 h-4 mr-2 text-indigo-500" /> Membros da Equipe</h5>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{organizationMembers.length} / {planInfo.maxUsers}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-1000" 
                            style={{ width: `${(organizationMembers.length / planInfo.maxUsers) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-800 dark:text-white flex items-center"><Zap className="w-4 h-4 mr-2 text-amber-500" /> Créditos de IA</h5>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{currentPlanKey === 'free' ? '85%' : 'Ilimitado'}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-amber-500 transition-all duration-1000" 
                            style={{ width: currentPlanKey === 'free' ? '85%' : '100%' }}
                        />
                    </div>
                </div>
              </div>

              {/* Billing Info */}
              <div className="space-y-4">
                 <h5 className="font-bold text-slate-800 dark:text-white flex items-center"><CardIcon className="w-5 h-5 mr-2" /> Cartão de Crédito</h5>
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                            <span className="text-indigo-600 font-bold text-xs uppercase tracking-tighter italic">VISA</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Visa terminando em 4242</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Expira em 12/28</p>
                        </div>
                    </div>
                    <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Editar</button>
                 </div>
              </div>

              {/* History */}
              <div className="space-y-4">
                <h5 className="font-bold text-slate-800 dark:text-white flex items-center"><Receipt className="w-5 h-5 mr-2" /> Histórico de Faturas</h5>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"><History className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Fatura #{1234 + i}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Paga em {10-i} Set, 2024</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800 dark:text-white">R$ {planInfo.price.toFixed(2)}</p>
                                <button className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold flex items-center ml-auto">
                                    PDF <ExternalLink className="w-2 h-2 ml-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="max-w-2xl space-y-8 animate-fadeIn">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-start space-x-4">
                <div className="bg-emerald-100 dark:bg-emerald-800 p-3 rounded-xl text-emerald-600 dark:text-emerald-300 shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Criptografia de Campo Ativa</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Seus dados sensíveis (Finanças e Agenda) são criptografados no seu navegador usando AES-GCM 256-bit antes de chegarem ao Firebase. Somente você possui a chave de acesso.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                 <h5 className="font-bold text-slate-800 dark:text-white flex items-center"><Key className="w-4 h-4 mr-2 text-indigo-500" /> Chave de Segurança</h5>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Sua chave é gerada a partir da sua identidade única. Nunca compartilhe sua senha do Google, pois ela é o ponto de acesso aos seus dados protegidos.</p>
                 <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 font-mono text-[10px] text-slate-400 break-all">
                    ID_ENCRYPTION_KEY: {user?.uid?.substring(0, 12)}...SECURED_BY_AES_256
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                 <h5 className="font-bold text-slate-800 dark:text-white mb-2">Logs de Acesso</h5>
                 <p className="text-xs text-slate-400">Último login detectado: {new Date().toLocaleString()}</p>
                 <button className="mt-4 text-xs text-rose-600 font-bold hover:underline">Sair de todos os dispositivos</button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
              <div className="max-w-2xl space-y-8 animate-fadeIn">
                  <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Alertas no App</h4>
                      
                      <div className="space-y-4">
                          {[
                              { id: 'pushNotifications', label: 'Notificações Push', desc: 'Alertas em tempo real sobre eventos da agenda.' },
                              { id: 'dailyEmail', label: 'E-mail Diário', desc: 'Receba seu briefing matinal por e-mail às 7h.' },
                              { id: 'monthlyReports', label: 'Relatórios Mensais', desc: 'Análise detalhada de finanças e produtividade todo dia 1º.' },
                              { id: 'aiSuggestions', label: 'Sugestões da IA', desc: 'Permitir que a IA envie insights proativos no chat.' }
                          ].map(pref => (
                              <div key={pref.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm hover:border-indigo-100 transition-colors">
                                  <div className="flex-1">
                                      <p className="text-sm font-bold text-slate-800 dark:text-white">{pref.label}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pref.desc}</p>
                                  </div>
                                  <button 
                                    onClick={() => togglePreference(pref.id)}
                                    className="p-1 text-indigo-600 dark:text-indigo-400 transition-all active:scale-90"
                                  >
                                      {(userProfile?.preferences as any)?.[pref.id] 
                                        ? <ToggleRight className="w-10 h-10" /> 
                                        : <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-500" />}
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-start space-x-3">
                          <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                          <div>
                              <h5 className="font-bold text-indigo-900 dark:text-indigo-100">Sincronização com WhatsApp</h5>
                              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Configure o recebimento de alertas diretamente no seu celular via bot oficial.</p>
                              <Button size="sm" className="mt-4 bg-indigo-600 text-white">Configurar Agora</Button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* FAMILY SUMMARY TAB */}
          {activeTab === 'family' && (
              <div className="max-w-2xl space-y-8 animate-fadeIn">
                  <div className="text-center py-10">
                      <div className="bg-rose-100 dark:bg-rose-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 mb-4">
                          <Users className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white">Unidade Familiar: {family?.name || 'Não configurada'}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Você está gerenciando uma unidade compartilhada com {family?.members.length || 0} pessoas.</p>
                      
                      <div className="mt-8 flex justify-center gap-3">
                          <Button onClick={() => window.location.hash = 'family'}>Ir para Painel da Família</Button>
                          <Button variant="secondary">Configurar Limites</Button>
                      </div>
                  </div>
              </div>
          )}

          {/* ORGANIZATION TAB (Admin Panel) */}
          {activeTab === 'organization' && (
              <AdminPanel 
                  members={organizationMembers}
                  currentPlan={currentPlanKey}
                  onInvite={inviteOrgMember}
                  onUpdateRole={updateMemberRole}
                  onUpdatePermissions={updateMemberPermissions}
                  onRemoveMember={removeOrgMember}
              />
          )}

        </div>
      </div>

      {showPricing && (
        <PricingModal 
            currentPlan={currentPlanKey} 
            onClose={() => setShowPricing(false)} 
            onUpgrade={(p) => { updatePlan(p); setShowPricing(false); }} 
        />
      )}
    </div>
  );
};
