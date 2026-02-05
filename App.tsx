
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { FloatingChat } from './components/FloatingChat';
import { Dashboard } from './components/Dashboard';
import { Finance } from './components/Finance';
import { Agenda } from './components/Agenda';
import { Tasks } from './components/Tasks';
import { StudyDashboard } from './components/study/StudyDashboard';
import { CRMBoard } from './components/business/CRMBoard';
import { HelpdeskBoard } from './components/business/HelpdeskBoard';
import { FamilyView } from './components/family/FamilyView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthScreen } from './components/auth/AuthScreen';
import { useAppData } from './hooks/useAppData';
import { useAuth } from './context/AuthContext';
import { useGamification } from './hooks/useGamification';
import { ViewState } from './types';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isWorkMode, setIsWorkMode] = useState(false);
  
  // Custom Hook for Data Management
  const { 
    transactions, 
    events, 
    tasks,
    categories, 
    budgets, 
    setCategories, 
    addTransaction, 
    editTransaction,
    deleteTransaction, 
    addEvent, 
    editEvent,
    deleteEvent, 
    addTask,
    editTask,
    deleteTask,
    updateBudget,
    addCategory,
    userProfile
  } = useAppData();

  const { addXP } = useGamification();

  // --- LÓGICA DE TEMA ROBUSTA ---
  useEffect(() => {
    // 1. Prioridade: Perfil do Usuário > Cache Local > Preferência do Sistema
    const profileTheme = userProfile?.preferences?.theme;
    const cachedTheme = localStorage.getItem('lifesync_theme') as 'light' | 'dark' | 'system' | null;
    const targetTheme = profileTheme || cachedTheme || 'system';

    const root = window.document.documentElement;

    const applyTheme = (theme: string) => {
        root.classList.remove('light', 'dark');
        
        let effectiveTheme = theme;
        if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        root.classList.add(effectiveTheme);
    };

    // Aplica o tema
    applyTheme(targetTheme);

    // Salva no cache local se vier do perfil (para o próximo load ser rápido)
    if (profileTheme) {
        localStorage.setItem('lifesync_theme', profileTheme);
    }

    // Listener para mudanças no sistema operacional (apenas se o tema for 'system')
    if (targetTheme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [userProfile?.preferences?.theme]);

  // Wrap addTask/Edit to award XP when completing
  const handleTaskComplete = async (t: any) => {
      if (t.status === 'done') {
          const { leveledUp, newLevel } = await addXP(50, 'task') || {};
          if (leveledUp) alert(`Level Up! Você alcançou o nível ${newLevel}`);
      }
      editTask(t);
  };

  if (loading) {
      return <div className="h-screen w-full flex items-center justify-center bg-app"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
      return <AuthScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          transactions={transactions} 
          events={events} 
          tasks={tasks}
          onViewChange={setCurrentView} 
          isWorkMode={isWorkMode}
        />;
      case 'finance':
        if (isWorkMode) return <Dashboard transactions={transactions} events={events} tasks={tasks} onViewChange={setCurrentView} isWorkMode={isWorkMode} />;
        return <Finance 
            transactions={transactions} 
            categories={categories}
            setCategories={setCategories}
            budgets={budgets}
            onUpdateBudget={updateBudget}
            onAddTransaction={addTransaction} 
            onEditTransaction={editTransaction}
            onDeleteTransaction={deleteTransaction}
            userId={user.uid}
        />;
      case 'agenda':
        return <Agenda 
            events={events} 
            onAddEvent={addEvent} 
            onEditEvent={editEvent}
            onDeleteEvent={deleteEvent} 
        />;
      case 'tasks':
        return <Tasks 
            tasks={tasks}
            onAddTask={addTask}
            onEditTask={handleTaskComplete}
            onDeleteTask={deleteTask}
        />;
      case 'studies':
        return <StudyDashboard />;
      case 'crm':
        return <CRMBoard />;
      case 'helpdesk':
        return <HelpdeskBoard />;
      case 'family':
        return <FamilyView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard 
          transactions={transactions} 
          events={events} 
          tasks={tasks}
          onViewChange={setCurrentView} 
          isWorkMode={isWorkMode}
        />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView} 
      isWorkMode={isWorkMode}
      toggleWorkMode={() => setIsWorkMode(!isWorkMode)}
    >
      {renderView()}

      <FloatingChat 
        transactions={transactions} 
        events={events} 
        onAddTransaction={addTransaction} 
        onAddEvent={addEvent} 
      />
    </Layout>
  );
};

export default App;
