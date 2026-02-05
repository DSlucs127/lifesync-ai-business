
import React, { useState } from 'react';
import { OrganizationMember, TeamRole, TeamPermissions, PLAN_CONFIGS, PlanTier } from '../../types';
import { Button } from '../Button';
import { Input, Select } from '../Input';
import { Users, Shield, Plus, MoreVertical, Trash2, Check, X, Lock, Unlock, BarChart, CreditCard, Calendar, Mail } from 'lucide-react';

interface AdminPanelProps {
  members: OrganizationMember[];
  currentPlan: PlanTier;
  onInvite: (email: string, role: TeamRole) => void;
  onUpdateRole: (memberId: string, role: TeamRole) => void;
  onUpdatePermissions: (memberId: string, permissions: TeamPermissions) => void;
  onRemoveMember: (memberId: string) => void;
}

const DEFAULT_PERMISSIONS: Record<TeamRole, TeamPermissions> = {
  owner: { viewFinance: true, editFinance: true, viewCRM: true, editCRM: true, manageTeam: true, viewReports: true },
  admin: { viewFinance: true, editFinance: true, viewCRM: true, editCRM: true, manageTeam: true, viewReports: true },
  manager: { viewFinance: true, editFinance: false, viewCRM: true, editCRM: true, manageTeam: false, viewReports: true },
  member: { viewFinance: false, editFinance: false, viewCRM: true, editCRM: true, manageTeam: false, viewReports: false }
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  members, currentPlan, onInvite, onUpdateRole, onUpdatePermissions, onRemoveMember 
}) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [editingPermissionsId, setEditingPermissionsId] = useState<string | null>(null);

  const planConfig = PLAN_CONFIGS[currentPlan];
  const maxUsers = planConfig.maxUsers || 1;
  const currentUsers = members.length;
  const canAddUser = currentUsers < maxUsers;

  const handleInvite = () => {
    if (inviteEmail && canAddUser) {
        onInvite(inviteEmail, inviteRole);
        setInviteEmail('');
        setShowInviteForm(false);
    }
  };

  const togglePermission = (member: OrganizationMember, key: keyof TeamPermissions) => {
      const newPerms = { ...member.permissions, [key]: !member.permissions[key] };
      onUpdatePermissions(member.id, newPerms);
  };

  return (
    <div className="space-y-6">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-700/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gestão da Organização</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie acessos, cargos e limites da sua equipe.</p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Licenças</p>
                    <p className={`text-lg font-bold ${currentUsers >= maxUsers ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {currentUsers} <span className="text-slate-400 dark:text-slate-500 text-sm">/ {maxUsers}</span>
                    </p>
                </div>
                <Button onClick={() => setShowInviteForm(true)} disabled={!canAddUser}>
                    <Plus className="w-4 h-4 mr-2" /> Convidar
                </Button>
            </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-100 dark:border-slate-600 shadow-sm animate-slideDown flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <Input 
                        label="E-mail do Colaborador" 
                        placeholder="colaborador@empresa.com" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select 
                        label="Cargo Inicial"
                        options={[
                            {value: 'admin', label: 'Administrador'},
                            {value: 'manager', label: 'Gerente'},
                            {value: 'member', label: 'Membro'}
                        ]}
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value as TeamRole)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={handleInvite} className="w-full md:w-auto">Enviar Convite</Button>
                    <Button variant="ghost" onClick={() => setShowInviteForm(false)} className="w-full md:w-auto"><X className="w-4 h-4" /></Button>
                </div>
            </div>
        )}

        {/* Members List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Membro</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cargo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acessos</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {members.map(member => (
                            <React.Fragment key={member.id}>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0">
                                                {member.name ? member.name.charAt(0).toUpperCase() : <Mail className="w-4 h-4" />}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{member.name || 'Convidado'}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.role === 'owner' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                                                <Shield className="w-3 h-3 mr-1" /> Owner
                                            </span>
                                        ) : (
                                            <select 
                                                value={member.role}
                                                onChange={(e) => {
                                                    const newRole = e.target.value as TeamRole;
                                                    onUpdateRole(member.id, newRole);
                                                    onUpdatePermissions(member.id, DEFAULT_PERMISSIONS[newRole]);
                                                }}
                                                className="text-sm border-slate-200 dark:border-slate-600 rounded-lg py-1.5 pl-2 pr-8 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                            >
                                                <option value="admin">Administrador</option>
                                                <option value="manager">Gerente</option>
                                                <option value="member">Membro</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                            member.status === 'active' 
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900' 
                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                                        }`}>
                                            {member.status === 'active' ? 'Ativo' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-3 text-slate-400 dark:text-slate-500">
                                            <div title="Finanças" className={member.permissions.viewFinance ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-30'}>
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div title="CRM" className={member.permissions.viewCRM ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-30'}>
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div title="Relatórios" className={member.permissions.viewReports ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-30'}>
                                                <BarChart className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {member.role !== 'owner' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditingPermissionsId(editingPermissionsId === member.id ? null : member.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${editingPermissionsId === member.id ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                    title="Permissões"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => onRemoveMember(member.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Remover Membro"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                {/* Expanded Permissions Panel */}
                                {editingPermissionsId === member.id && (
                                    <tr>
                                        <td colSpan={5} className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 shadow-inner">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Finanças</h4>
                                                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input type="checkbox" checked={member.permissions.viewFinance} onChange={() => togglePermission(member, 'viewFinance')} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                                                        <span>Visualizar</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input type="checkbox" checked={member.permissions.editFinance} onChange={() => togglePermission(member, 'editFinance')} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                                                        <span>Editar/Criar</span>
                                                    </label>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CRM & Vendas</h4>
                                                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input type="checkbox" checked={member.permissions.viewCRM} onChange={() => togglePermission(member, 'viewCRM')} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                                                        <span>Acessar CRM</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input type="checkbox" checked={member.permissions.editCRM} onChange={() => togglePermission(member, 'editCRM')} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                                                        <span>Gerenciar Leads</span>
                                                    </label>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gestão</h4>
                                                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input type="checkbox" checked={member.permissions.manageTeam} onChange={() => togglePermission(member, 'manageTeam')} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                                                        <span>Gerenciar Equipe</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input type="checkbox" checked={member.permissions.viewReports} onChange={() => togglePermission(member, 'viewReports')} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                                                        <span>Ver Relatórios</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
