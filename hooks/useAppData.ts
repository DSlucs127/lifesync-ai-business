
// @google/genai used in this project is handled in geminiService.ts

import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Transaction, Lead, CalendarEvent, SupportTicket, Task, Category, Budget, Contact, Company, TeamMember, PlanTier, Family, FamilyInvite, UserProfile, OrganizationMember, TeamRole, TeamPermissions } from '../types';
import { encryptField, decryptField } from '../services/security/encryption';

export const useAppData = (activeWorkspaceId?: string) => {
  const { user } = useAuth();
  const isDemo = user?.uid === 'demo-user';

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [subscription, setSubscription] = useState<{ plan: PlanTier } | null>(null);
  
  const [family, setFamily] = useState<Family | null>(null);
  const [familyInvites, setFamilyInvites] = useState<FamilyInvite[]>([]);
  const [familyTransactions, setFamilyTransactions] = useState<Transaction[]>([]);
  const [familyEvents, setFamilyEvents] = useState<CalendarEvent[]>([]);

  // Helpers de Criptografia
  const decryptTransaction = async (t: any, uid: string): Promise<Transaction> => {
      if (uid === 'demo-user') return t; // Skip decryption for demo
      return {
        ...t,
        description: await decryptField(t.description, uid),
        category: await decryptField(t.category, uid),
        amount: parseFloat(await decryptField(t.amount, uid) || "0")
      };
  };

  const decryptEvent = async (e: any, uid: string): Promise<CalendarEvent> => {
      if (uid === 'demo-user') return e;
      return {
        ...e,
        title: await decryptField(e.title, uid),
        description: await decryptField(e.description, uid),
        category: await decryptField(e.category, uid)
      };
  };

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
        // --- DEMO MODE: MOCK DATA ---
        // Only initializing data if it hasn't been set (simulating persistent session for demo)
        if (!userProfile) {
            setUserProfile({ 
                uid: 'demo-user', displayName: 'Visitante Demo', email: 'demo@lifesync.ai', 
                xp: 1250, level: 3, workspaces: [], 
                preferences: { theme: 'system', dailyEmail: false, pushNotifications: false, monthlyReports: false, aiSuggestions: true } 
            } as any);
            
            const now = new Date();
            setTransactions([
                { id: '1', userId: 'demo-user', description: 'Supermercado', amount: 450.50, type: 'expense', category: 'Alimentação', date: now.toISOString() },
                { id: '2', userId: 'demo-user', description: 'Salário', amount: 5000.00, type: 'income', category: 'Trabalho', date: new Date(now.setDate(now.getDate()-5)).toISOString() },
                { id: '3', userId: 'demo-user', description: 'Netflix', amount: 55.90, type: 'expense', category: 'Lazer', date: new Date(now.setDate(now.getDate()-2)).toISOString() }
            ]);
            
            setEvents([
                { id: '1', userId: 'demo-user', title: 'Reunião de Projeto', date: new Date().toISOString(), durationMinutes: 60, category: 'Trabalho', kind: 'event', recurrence: 'none' },
                { id: '2', userId: 'demo-user', title: 'Academia', date: new Date(new Date().setHours(18,0,0,0)).toISOString(), durationMinutes: 60, category: 'Saúde', kind: 'routine', recurrence: 'daily' }
            ]);

            setTasks([
                { id: '1', userId: 'demo-user', title: 'Finalizar relatório', status: 'in_progress', priority: 'high', reminder: true },
                { id: '2', userId: 'demo-user', title: 'Comprar presente', status: 'todo', priority: 'medium', reminder: false }
            ]);

            setCategoriesState([
                { id: '1', userId: 'demo-user', name: 'Alimentação', color: 'bg-orange-100' },
                { id: '2', userId: 'demo-user', name: 'Trabalho', color: 'bg-blue-100' },
                { id: '3', userId: 'demo-user', name: 'Lazer', color: 'bg-purple-100' },
                { id: '4', userId: 'demo-user', name: 'Saúde', color: 'bg-emerald-100' }
            ]);

            setBudgets([{ categoryId: 'Alimentação', limit: 800, userId: 'demo-user' }]);
            // Default to Free on init, but user can upgrade in UI
            if (!subscription) setSubscription({ plan: 'free' });
            
            setLeads([
                { id: '1', workspaceId: 'demo', name: 'Tech Solutions Ltda', company: 'Tech Solutions', value: 15000, status: 'negotiation', assignedTo: 'demo-user', createdAt: now.toISOString() },
                { id: '2', workspaceId: 'demo', name: 'João da Silva', company: 'Silva Comércio', value: 5000, status: 'contacted', assignedTo: 'demo-user', createdAt: now.toISOString() }
            ]);
        }
        return; 
    }

    // --- FIREBASE LIVE MODE ---
    const userRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserProfile({ uid: user.uid, ...snap.data() } as UserProfile);
      } else {
        const initialProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Usuário',
          email: user.email || '',
          notificationEmail: user.email || '',
          workspaces: [],
          xp: 0,
          level: 1,
          preferences: { theme: 'system', dailyEmail: true, pushNotifications: true, monthlyReports: false, aiSuggestions: true }
        };
        setDoc(userRef, initialProfile);
      }
    });

    const qTrans = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('familyId', '==', null));
    const unsubTrans = onSnapshot(qTrans, async (s) => {
        const decrypted = await Promise.all(s.docs.map(async d => decryptTransaction({id: d.id, ...d.data()}, user.uid)));
        setTransactions(decrypted);
    });

    const qEvents = query(collection(db, 'events'), where('userId', '==', user.uid), where('familyId', '==', null));
    const unsubEvents = onSnapshot(qEvents, async (s) => {
        const decrypted = await Promise.all(s.docs.map(async d => decryptEvent({id: d.id, ...d.data()}, user.uid)));
        setEvents(decrypted);
    });

    const qLeads = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const unsubLeads = onSnapshot(qLeads, (s) => setLeads(s.docs.map(d => ({id: d.id, ...d.data()} as Lead))));

    const qContacts = query(collection(db, 'contacts'), where('userId', '==', user.uid));
    const unsubContacts = onSnapshot(qContacts, (s) => setContacts(s.docs.map(d => ({id: d.id, ...d.data()} as Contact))));

    const qCompanies = query(collection(db, 'companies'), where('userId', '==', user.uid));
    const unsubCompanies = onSnapshot(qCompanies, (s) => setCompanies(s.docs.map(d => ({id: d.id, ...d.data()} as Company))));

    const qTickets = query(collection(db, 'tickets'), where('userId', '==', user.uid));
    const unsubTickets = onSnapshot(qTickets, (s) => setTickets(s.docs.map(d => ({id: d.id, ...d.data()} as SupportTicket))));

    const qTeam = query(collection(db, 'team_members'), where('userId', '==', user.uid));
    const unsubTeam = onSnapshot(qTeam, (s) => setTeamMembers(s.docs.map(d => ({id: d.id, ...d.data()} as TeamMember))));

    const qOrgMembers = query(collection(db, 'organization_members'), where('organizationOwnerId', '==', user.uid));
    const unsubOrgMembers = onSnapshot(qOrgMembers, (s) => {
        if (!s.empty) {
            setOrganizationMembers(s.docs.map(d => ({id: d.id, ...d.data()} as OrganizationMember)));
        } else {
            setOrganizationMembers([{
                id: 'owner',
                uid: user.uid,
                organizationOwnerId: user.uid,
                name: user.displayName || 'Você',
                email: user.email || '',
                role: 'owner',
                status: 'active',
                joinedAt: new Date().toISOString(),
                permissions: { viewFinance: true, editFinance: true, viewCRM: true, editCRM: true, manageTeam: true, viewReports: true }
            }]);
        }
    });

    const qTasks = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubTasks = onSnapshot(qTasks, (s) => setTasks(s.docs.map(d => ({id: d.id, ...d.data()} as Task))));

    const qCats = query(collection(db, 'categories'), where('userId', '==', user.uid));
    const unsubCats = onSnapshot(qCats, (s) => setCategoriesState(s.docs.map(d => ({id: d.id, ...d.data()} as Category))));

    const qBudgets = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const unsubBudgets = onSnapshot(qBudgets, (s) => setBudgets(s.docs.map(d => ({...d.data()} as Budget))));

    const qSub = query(collection(db, 'subscriptions'), where('userId', '==', user.uid));
    const unsubSub = onSnapshot(qSub, (s) => {
        if (!s.empty) setSubscription(s.docs[0].data() as { plan: PlanTier });
        else setSubscription({ plan: 'free' });
    });

    const qFamily = query(collection(db, 'families'), where('members', 'array-contains', user.uid));
    const unsubFamily = onSnapshot(qFamily, (s) => {
        if (!s.empty) {
            const familyData = { id: s.docs[0].id, ...s.docs[0].data() } as Family;
            setFamily(familyData);
            
            const qFamTrans = query(collection(db, 'transactions'), where('familyId', '==', familyData.id));
            const unsubFamTrans = onSnapshot(qFamTrans, async (ss) => {
                const decrypted = await Promise.all(ss.docs.map(async d => decryptTransaction({id: d.id, ...d.data()}, user.uid)));
                setFamilyTransactions(decrypted);
            });
            
            const qFamEvents = query(collection(db, 'events'), where('familyId', '==', familyData.id));
            const unsubFamEvents = onSnapshot(qFamEvents, async (ss) => {
                const decrypted = await Promise.all(ss.docs.map(async d => decryptEvent({id: d.id, ...d.data()}, user.uid)));
                setFamilyEvents(decrypted);
            });
            
            return () => { unsubFamTrans(); unsubFamEvents(); };
        } else {
            setFamily(null);
            setFamilyTransactions([]);
            setFamilyEvents([]);
        }
    });

    const qInvites = query(collection(db, 'family_invites'), where('toEmail', '==', user.email), where('status', '==', 'pending'));
    const unsubInvites = onSnapshot(qInvites, (s) => setFamilyInvites(s.docs.map(d => ({id: d.id, ...d.data()} as FamilyInvite))));

    return () => { 
      unsubProfile(); unsubTrans(); unsubEvents(); unsubTasks(); unsubCats(); unsubBudgets(); unsubSub(); 
      unsubFamily(); unsubInvites(); unsubLeads(); unsubContacts(); unsubCompanies(); unsubTickets(); unsubTeam(); unsubOrgMembers();
    };
  }, [user, activeWorkspaceId, isDemo]);

  // --- ACTIONS ---

  const addTransaction = async (t: Omit<Transaction, 'id' | 'userId'>) => {
      if (!user) return;
      if (isDemo) {
          setTransactions(prev => [...prev, { ...t, id: Date.now().toString(), userId: 'demo-user' }]);
          return;
      }
      const encryptedData = {
          ...t,
          userId: user.uid,
          description: await encryptField(t.description, user.uid),
          category: await encryptField(t.category, user.uid),
          amount: await encryptField(t.amount, user.uid),
          workspaceId: activeWorkspaceId || null,
          familyId: null
      };
      return addDoc(collection(db, 'transactions'), encryptedData);
  };

  const addEvent = async (e: Omit<CalendarEvent, 'id' | 'userId'>) => {
      if (!user) return;
      if (isDemo) {
          setEvents(prev => [...prev, { ...e, id: Date.now().toString(), userId: 'demo-user' }]);
          return;
      }
      const encryptedData = {
          ...e,
          userId: user.uid,
          title: await encryptField(e.title, user.uid),
          description: await encryptField(e.description || "", user.uid),
          category: await encryptField(e.category, user.uid),
          workspaceId: activeWorkspaceId || null,
          familyId: null
      };
      return addDoc(collection(db, 'events'), encryptedData);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    if (isDemo) {
        setUserProfile(prev => prev ? ({ ...prev, ...data }) : null);
        return;
    }
    return updateDoc(doc(db, 'users', user.uid), data);
  };

  const editTransaction = async (t: Transaction) => {
      if (!user) return;
      if (isDemo) {
          setTransactions(prev => prev.map(tr => tr.id === t.id ? t : tr));
          return;
      }
      const encryptedData = {
          ...t,
          description: await encryptField(t.description, user.uid),
          category: await encryptField(t.category, user.uid),
          amount: await encryptField(t.amount, user.uid),
      };
      return updateDoc(doc(db, 'transactions', t.id), encryptedData);
  };

  const deleteTransaction = (id: string) => {
      if (isDemo) {
          setTransactions(prev => prev.filter(t => t.id !== id));
          return;
      }
      return deleteDoc(doc(db, 'transactions', id));
  }
  
  const editEvent = (e: CalendarEvent) => {
      if (isDemo) {
          setEvents(prev => prev.map(ev => ev.id === e.id ? e : ev));
          return;
      }
      return updateDoc(doc(db, 'events', e.id), { ...e });
  }

  const deleteEvent = (id: string) => {
      if (isDemo) {
          setEvents(prev => prev.filter(e => e.id !== id));
          return;
      }
      return deleteDoc(doc(db, 'events', id));
  }

  const addTask = (t: Omit<Task, 'id' | 'userId'>) => {
      if (isDemo) {
          setTasks(prev => [...prev, { ...t, id: Date.now().toString(), userId: 'demo-user' }]);
          return;
      }
      return addDoc(collection(db, 'tasks'), { ...t, userId: user?.uid, workspaceId: activeWorkspaceId || null });
  };
  
  const editTask = (t: Task) => {
      if (isDemo) {
          setTasks(prev => prev.map(task => task.id === t.id ? t : task));
          return;
      }
      return updateDoc(doc(db, 'tasks', t.id), { ...t });
  }
  
  const deleteTask = (id: string) => {
      if (isDemo) {
          setTasks(prev => prev.filter(t => t.id !== id));
          return;
      }
      return deleteDoc(doc(db, 'tasks', id));
  }

  const updateBudget = (b: Omit<Budget, 'userId'>) => {
      if (!user) return;
      if (isDemo) {
          setBudgets(prev => {
              const filtered = prev.filter(bud => bud.categoryId !== b.categoryId);
              return [...filtered, { ...b, userId: 'demo-user' }];
          });
          return;
      }
      return setDoc(doc(db, 'budgets', `${user.uid}_${b.categoryId}`), { ...b, userId: user.uid });
  };

  const addCategory = (name: string) => {
      if (!user) return;
      if (isDemo) {
          setCategoriesState(prev => [...prev, { id: Date.now().toString(), name, userId: 'demo-user', color: 'bg-indigo-100' }]);
          return;
      }
      return addDoc(collection(db, 'categories'), { name, userId: user.uid, color: 'bg-indigo-100 text-indigo-700' });
  };

  const setCategories = (updater: any) => { if(isDemo) setCategoriesState(updater); };

  const addLead = (l: any) => { 
      if(isDemo) { setLeads(prev => [...prev, { ...l, id: Date.now().toString(), createdAt: new Date().toISOString() }]); return; }
      if (!user) return;
      return addDoc(collection(db, 'leads'), { ...l, userId: user.uid, workspaceId: activeWorkspaceId || null, createdAt: new Date().toISOString() });
  };
  const updateLead = (l: any) => {
      if(isDemo) { setLeads(prev => prev.map(lead => lead.id === l.id ? l : lead)); return; }
      return updateDoc(doc(db, 'leads', l.id), { ...l });
  };
  const deleteLead = (id: string) => deleteDoc(doc(db, 'leads', id)); 

  const addContact = (c: any) => {
      if(isDemo) { setContacts(prev => [...prev, { ...c, id: Date.now().toString() }]); return; }
      if (!user) return;
      return addDoc(collection(db, 'contacts'), { ...c, userId: user.uid, workspaceId: activeWorkspaceId || null });
  };
  const updateContact = (c: any) => updateDoc(doc(db, 'contacts', c.id), { ...c });
  const deleteContact = (id: string) => deleteDoc(doc(db, 'contacts', id));

  const addCompany = (c: any) => {
      if(isDemo) { setCompanies(prev => [...prev, { ...c, id: Date.now().toString() }]); return; }
      if (!user) return;
      return addDoc(collection(db, 'companies'), { ...c, userId: user.uid, workspaceId: activeWorkspaceId || null });
  };
  const updateCompany = (c: any) => updateDoc(doc(db, 'companies', c.id), { ...c });
  const deleteCompany = (id: string) => deleteDoc(doc(db, 'companies', id));

  const addTicket = (t: any) => {
      if(isDemo) { setTickets(prev => [...prev, { ...t, id: Date.now().toString(), createdAt: new Date().toISOString(), ticketNumber: 'DEMO-123' }]); return; }
      if (!user) return;
      const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      return addDoc(collection(db, 'tickets'), { ...t, ticketNumber, userId: user.uid, workspaceId: activeWorkspaceId || null, createdAt: new Date().toISOString() });
  };
  const updateTicket = (t: any) => updateDoc(doc(db, 'tickets', t.id), { ...t });

  const updatePlan = async (plan: PlanTier) => {
    if (!user) return;
    if (isDemo) { 
        setSubscription({ plan }); 
        return; 
    }
    const q = query(collection(db, 'subscriptions'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return updateDoc(doc(db, 'subscriptions', snap.docs[0].id), { plan });
    } else {
      return addDoc(collection(db, 'subscriptions'), { userId: user.uid, plan });
    }
  };

  const createFamily = async (name: string) => {
    if (!user) return;
    if (isDemo) { setFamily({ id: 'demo-fam', name, ownerId: 'demo-user', members: ['demo-user'], invitedEmails: [], createdAt: new Date().toISOString() }); return; }
    
    const familyData: Omit<Family, 'id'> = {
      name,
      ownerId: user.uid,
      members: [user.uid],
      invitedEmails: [],
      createdAt: new Date().toISOString()
    };
    return addDoc(collection(db, 'families'), familyData);
  };

  const inviteToFamily = async (email: string) => {
    if (!user || !family) return;
    if (isDemo) { setFamily(prev => prev ? ({ ...prev, invitedEmails: [...prev.invitedEmails, email] }) : null); return; }
    
    const invite: any = {
      familyId: family.id,
      familyName: family.name,
      fromEmail: user.email || '',
      fromUserId: user.uid,
      toEmail: email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'family_invites'), invite);
    return updateDoc(doc(db, 'families', family.id), {
      invitedEmails: arrayUnion(email)
    });
  };

  const acceptFamilyInvite = async (invite: FamilyInvite) => {
      if (!user) return;
      await updateDoc(doc(db, 'family_invites', invite.id), { status: 'accepted' });
      const familyRef = doc(db, 'families', invite.familyId);
      return updateDoc(familyRef, {
        members: arrayUnion(user.uid),
        invitedEmails: arrayRemove(user.email)
      });
  };

  const addFamilyTransaction = async (t: any) => {
      if(isDemo) { setFamilyTransactions(prev => [...prev, { ...t, id: Date.now().toString(), userId: 'demo-user' }]); return; }
      if (!user || !family) return;
      const encryptedData = {
          ...t,
          userId: user.uid,
          description: await encryptField(t.description, user.uid),
          category: await encryptField(t.category, user.uid),
          amount: await encryptField(t.amount, user.uid),
          workspaceId: null,
          familyId: family.id
      };
      return addDoc(collection(db, 'transactions'), encryptedData);
  }

  const addFamilyEvent = async (e: any) => {
      if(isDemo) { setFamilyEvents(prev => [...prev, { ...e, id: Date.now().toString(), userId: 'demo-user' }]); return; }
      if (!user || !family) return;
      const encryptedData = {
          ...e,
          userId: user.uid,
          title: await encryptField(e.title, user.uid),
          description: await encryptField(e.description || "", user.uid),
          category: await encryptField(e.category, user.uid),
          workspaceId: null,
          familyId: family.id
      };
      return addDoc(collection(db, 'events'), encryptedData);
  }

  const inviteOrgMember = async (email: string, role: TeamRole) => {
      if(isDemo) { setOrganizationMembers(prev => [...prev, { id: Date.now().toString(), name: email.split('@')[0], email, role, status: 'invited', organizationOwnerId: 'demo-user', joinedAt: new Date().toISOString(), permissions: { viewFinance: true, editFinance: true, viewCRM: true, editCRM: true, manageTeam: true, viewReports: true } }]); return; }
      if (!user) return;
      const newMember = {
          organizationOwnerId: user.uid,
          email,
          name: email.split('@')[0],
          role,
          status: 'invited',
          joinedAt: new Date().toISOString(),
          permissions: {
              viewFinance: role === 'admin' || role === 'owner',
              editFinance: role === 'admin' || role === 'owner',
              viewCRM: true,
              editCRM: role !== 'member',
              manageTeam: role === 'admin' || role === 'owner',
              viewReports: true
          }
      };
      return addDoc(collection(db, 'organization_members'), newMember);
  };

  const updateMemberRole = async (memberId: string, role: TeamRole) => {
      if(isDemo) { setOrganizationMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m)); return; }
      return updateDoc(doc(db, 'organization_members', memberId), { role });
  };

  const updateMemberPermissions = async (memberId: string, permissions: TeamPermissions) => {
      if(isDemo) { setOrganizationMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions } : m)); return; }
      return updateDoc(doc(db, 'organization_members', memberId), { permissions });
  };

  const removeOrgMember = async (memberId: string) => {
      if(isDemo) { setOrganizationMembers(prev => prev.filter(m => m.id !== memberId)); return; }
      return deleteDoc(doc(db, 'organization_members', memberId));
  };

  return { 
    userProfile, leads, transactions, events, tasks, tickets, categories, budgets, contacts, companies, teamMembers, subscription,
    family, familyInvites, familyTransactions, familyEvents, organizationMembers,
    updateProfile, addTransaction, editTransaction, deleteTransaction, addEvent, editEvent, deleteEvent, 
    addTask, editTask, deleteTask, updateBudget, addCategory, setCategories,
    addLead, updateLead, deleteLead, addContact, updateContact, deleteContact, addCompany, updateCompany, deleteCompany,
    addTicket, updateTicket, updatePlan, createFamily, inviteToFamily, acceptFamilyInvite, addFamilyTransaction, addFamilyEvent,
    inviteOrgMember, updateMemberRole, updateMemberPermissions, removeOrgMember
  };
};
