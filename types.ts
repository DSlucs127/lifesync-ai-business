
export type PlanTier = 'free' | 'pro' | 'pro_plus' | 'business_solo' | 'sales_team' | 'service_desk';

export const AGENDA_CATEGORIES = ['Trabalho', 'Saúde', 'Lazer', 'Estudos', 'Finanças', 'Outros', 'Família'];

export const PLAN_CONFIGS: Record<string, any> = {
  free: { label: 'Free', price: 0, hasAds: true, type: 'B2C', hasFamily: false, maxUsers: 1 },
  pro: { label: 'Pro', price: 29.9, hasAds: false, type: 'B2C', hasFamily: false, maxUsers: 1 },
  pro_plus: { label: 'Pro+', price: 49.9, hasAds: false, type: 'B2C', hasFamily: true, maxUsers: 1 },
  business_solo: { label: 'Solo', price: 99.9, hasAds: false, type: 'B2B', hasFamily: true, maxUsers: 1 },
  sales_team: { label: 'Team', price: 299.9, hasAds: false, type: 'B2B', hasFamily: true, maxUsers: 5 },
  service_desk: { label: 'Desk', price: 499.9, hasAds: false, type: 'B2B', hasFamily: true, maxUsers: 10 },
};

export type TeamRole = 'owner' | 'admin' | 'manager' | 'member';

export interface TeamPermissions {
  viewFinance: boolean;
  editFinance: boolean;
  viewCRM: boolean;
  editCRM: boolean;
  manageTeam: boolean;
  viewReports: boolean;
}

export interface OrganizationMember {
  id: string;
  organizationOwnerId: string; // Added field for security rules
  uid?: string; // ID do usuário se já registrado
  email: string;
  name: string;
  role: TeamRole;
  status: 'active' | 'invited' | 'disabled';
  permissions: TeamPermissions;
  department?: string;
  joinedAt: string;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // UIDs dos membros aceitos
  invitedEmails: string[]; // Emails aguardando convite
  createdAt: string;
}

export interface FamilyInvite {
  id: string;
  familyId: string;
  familyName: string;
  fromEmail: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; 
  createdAt: string;
  settings: {
    logoUrl?: string;
    primaryColor?: string;
    currency: string;
  };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  notificationEmail?: string; // E-mail para avisos
  activeWorkspaceId?: string;
  workspaces: string[];
  xp: number;
  level: number;
  familyId?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    dailyEmail: boolean;
    pushNotifications: boolean;
    monthlyReports: boolean;
    aiSuggestions: boolean;
  };
}

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  value: number;
  status: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  assignedTo: string;
  createdAt: string;
  contactId?: string;
  probability?: number;
  lastInteraction?: string;
  aiAnalysis?: string; // Sugestões e análise da IA Gemini
}

export interface TicketEvent {
  id: string;
  type: 'reply' | 'status_change' | 'note' | string;
  authorId: string;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  workspaceId: string;
  ticketNumber: string;
  title: string;
  description?: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  contactId?: string;
  tags: string[];
  department: string;
  slaDue?: string;
  history?: TicketEvent[];
  internalNotes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  workspaceId?: string;
  familyId?: string; // Adicionado para transações compartilhadas
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurrence?: 'none' | 'monthly' | 'weekly';
}

export interface CalendarEvent {
  id: string;
  userId: string;
  workspaceId?: string;
  familyId?: string; // Adicionado para eventos compartilhados
  date: string;
  title: string;
  durationMinutes: number;
  kind: 'personal' | 'work' | 'event' | 'routine' | 'family';
  category: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
  reminders?: number[];
  notifyEmail?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  dueDate?: string;
  reminder: boolean;
  subtasks?: Task[];
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface Budget {
  categoryId: string;
  limit: number;
  userId?: string;
}

export interface UserStats {
  userId: string;
  level: number;
  currentXP: number;
  maxXP: number;
  streakDays: number;
  lastActiveDate: string;
  totalTasksCompleted: number;
  totalStudyModulesCompleted: number;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  theme: string;
  nodes: StudyNode[];
  createdAt: string;
}

export interface StudyNode {
  id: string;
  title: string;
  description: string;
  position: number;
  status: 'locked' | 'unlocked' | 'completed';
  content?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Contact {
  id: string;
  workspaceId?: string;
  companyId?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  whatsappStatus?: 'not_connected' | 'connected';
  assignedTo?: string;
}

export interface Company {
  id: string;
  workspaceId?: string;
  name: string;
  sector: string;
  website?: string;
  address?: string;
  size?: '1-10' | '11-50' | '50-200' | '200+';
  assignedTo?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  department: string;
}

export interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  data: string;
  name: string;
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'file';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  whatsappId?: string;
}

export interface WhatsAppConnectionState {
  status: 'DISCONNECTED' | 'QR_READY' | 'READY' | 'AUTHENTICATED';
  qrCode?: string;
}

export type ViewState = 'dashboard' | 'finance' | 'agenda' | 'tasks' | 'crm' | 'helpdesk' | 'settings' | 'studies' | 'family';