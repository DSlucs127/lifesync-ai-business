
import React, { useState } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { useAuth } from '../../context/AuthContext';
import { Family, FamilyInvite, Transaction, CalendarEvent } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { Heart, Users, Wallet, Calendar, Plus, Mail, Check, X, Shield, Star } from 'lucide-react';
import { TransactionList } from '../finance/TransactionList';
import { AgendaList } from '../agenda/AgendaList';
import { TransactionForm } from '../finance/TransactionForm';
import { EventForm } from '../agenda/EventForm';

export const FamilyView: React.FC = () => {
    const { user } = useAuth();
    const { 
        family, familyInvites, familyTransactions, familyEvents, categories,
        createFamily, inviteToFamily, acceptFamilyInvite, addFamilyTransaction, addFamilyEvent,
        deleteTransaction, deleteEvent
    } = useAppData();

    const [activeTab, setActiveTab] = useState<'members' | 'finance' | 'agenda'>('members');
    const [familyName, setFamilyName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [isAddingTransaction, setIsAddingTransaction] = useState(false);
    const [isAddingEvent, setIsAddingEvent] = useState(false);

    if (!family && familyInvites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center min-h-[500px] animate-fadeIn">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Crie sua Família LifeSync</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    Compartilhe finanças e agenda com quem você ama. Mantenha os dados individuais privados e tenha uma visão clara do coletivo.
                </p>
                <div className="flex w-full max-w-md gap-2">
                    <Input 
                        placeholder="Nome da Família (Ex: Família Silva)" 
                        value={familyName}
                        onChange={e => setFamilyName(e.target.value)}
                    />
                    <Button onClick={() => createFamily(familyName)} disabled={!familyName.trim()}>
                        Criar
                    </Button>
                </div>
            </div>
        );
    }

    if (!family && familyInvites.length > 0) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-slate-900">Convites de Família</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyInvites.map(invite => (
                        <div key={invite.id} className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex flex-col items-center text-center">
                            <div className="bg-rose-50 p-4 rounded-full mb-4">
                                <Heart className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Você foi convidado para a {invite.familyName}!</h3>
                            <p className="text-slate-500 text-sm mt-1 mb-6">De: {invite.fromEmail}</p>
                            <div className="flex gap-2 w-full">
                                <Button className="flex-1 bg-rose-500 hover:bg-rose-600" onClick={() => acceptFamilyInvite(invite)}>
                                    Aceitar Convite
                                </Button>
                                <Button variant="secondary" className="flex-1">
                                    Recusar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-24">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-rose-500 p-3 rounded-xl shadow-lg shadow-rose-100">
                        <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{family?.name}</h2>
                        <p className="text-slate-500 text-sm">{family?.members.length} membros ativos</p>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'members' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Membros</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('finance')}
                        className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'finance' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Wallet className="w-4 h-4" />
                        <span>Finanças</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('agenda')}
                        className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'agenda' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Agenda</span>
                    </button>
                </div>
            </header>

            {/* TAB MEMBERS */}
            {activeTab === 'members' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-700 uppercase">Membros da Família</h4>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {family?.members.map(memberUid => (
                                    <div key={memberUid} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                {memberUid === family.ownerId ? <Shield className="w-5 h-5 text-amber-500" /> : <Users className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {memberUid === user?.uid ? 'Você' : 'Membro'} 
                                                    {memberUid === family.ownerId && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Admin</span>}
                                                </p>
                                                <p className="text-xs text-slate-400">Ativo na família</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-xs text-slate-400">
                                            Online
                                        </div>
                                    </div>
                                ))}
                                {family?.invitedEmails.map(email => (
                                    <div key={email} className="p-4 flex items-center justify-between bg-slate-50/50">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 italic">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-400">{email}</p>
                                                <p className="text-[10px] bg-indigo-50 text-indigo-600 w-fit px-1.5 py-0.5 rounded mt-0.5 font-bold uppercase">Aguardando...</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4">Convidar Novo Membro</h4>
                            <div className="space-y-4">
                                <Input 
                                    label="Email do familiar" 
                                    placeholder="familia@email.com" 
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                />
                                <Button className="w-full" onClick={() => { inviteToFamily(inviteEmail); setInviteEmail(''); }} disabled={!inviteEmail.includes('@')}>
                                    Enviar Convite
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-4 text-center">
                                O convidado receberá uma notificação ao fazer login.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB FINANCE */}
            {activeTab === 'finance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-rose-500 p-6 rounded-2xl text-white shadow-lg shadow-rose-100">
                            <p className="text-rose-100 text-xs font-bold uppercase mb-1">Saldo da Família</p>
                            <h3 className="text-3xl font-black">
                                R$ {familyTransactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0).toFixed(2)}
                            </h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Entradas Coletivas</p>
                            <h3 className="text-2xl font-bold text-emerald-600">
                                R$ {familyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                            </h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Despesas Coletivas</p>
                            <h3 className="text-2xl font-bold text-rose-600">
                                R$ {familyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                            </h3>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-slate-800">Transações Compartilhadas</h4>
                        <Button onClick={() => setIsAddingTransaction(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Adicionar Gasto Familiar
                        </Button>
                    </div>

                    {isAddingTransaction && (
                        <TransactionForm 
                            categories={categories}
                            onSubmit={(t) => { addFamilyTransaction(t); setIsAddingTransaction(false); }}
                            onCancel={() => setIsAddingTransaction(false)}
                        />
                    )}

                    <TransactionList 
                        transactions={familyTransactions}
                        onDelete={deleteTransaction}
                        onEdit={() => {}} // TODO: Add edit logic for family trans
                    />
                </div>
            )}

            {/* TAB AGENDA */}
            {activeTab === 'agenda' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-slate-800">Agenda da Família</h4>
                        <Button onClick={() => setIsAddingEvent(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Novo Evento Familiar
                        </Button>
                    </div>

                    {isAddingEvent && (
                        <EventForm 
                            onAddEvent={(e) => { addFamilyEvent(e); setIsAddingEvent(false); }}
                            onCancel={() => setIsAddingEvent(false)}
                        />
                    )}

                    <AgendaList 
                        events={familyEvents}
                        onDeleteEvent={deleteEvent}
                        onEditEvent={() => {}} // TODO: Add edit logic for family events
                    />
                </div>
            )}
        </div>
    );
};
