
import React, { useState } from 'react';
import { Transaction, Category } from '../../types';
import { Input, Select } from '../Input';
import { Button } from '../Button';

interface TransactionFormProps {
  categories: Category[];
  // Fix: Omit userId from the expected submit payload
  onSubmit: (t: Omit<Transaction, 'id' | 'userId'>) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ categories, onSubmit, onCancel }) => {
  const [newTrans, setNewTrans] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: categories[0]?.name || 'Outros',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'none'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      description: newTrans.description,
      amount: parseFloat(newTrans.amount),
      type: newTrans.type as 'income' | 'expense',
      category: newTrans.category,
      date: new Date(newTrans.date).toISOString(),
      recurrence: newTrans.recurrence as any
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-slideDown mb-6">
      <h3 className="text-lg font-medium mb-4 text-slate-900">Nova Transação</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Descrição" 
          placeholder="Ex: Compras no mercado"
          required
          value={newTrans.description}
          onChange={e => setNewTrans({...newTrans, description: e.target.value})}
        />
        <Input 
          label="Valor (R$)" 
          type="number" 
          step="0.01" 
          required
          value={newTrans.amount}
          onChange={e => setNewTrans({...newTrans, amount: e.target.value})}
        />
        <Select 
          label="Tipo"
          options={[{value: 'expense', label: 'Despesa'}, {value: 'income', label: 'Receita'}]}
          value={newTrans.type}
          onChange={e => setNewTrans({...newTrans, type: e.target.value})}
        />
        <Select 
          label="Categoria"
          options={categories.map(c => ({value: c.name, label: c.name}))}
          value={newTrans.category}
          onChange={e => setNewTrans({...newTrans, category: e.target.value})}
        />
        <Input 
          label="Data" 
          type="date" 
          required
          value={newTrans.date}
          onChange={e => setNewTrans({...newTrans, date: e.target.value})}
        />
        <Select 
          label="Recorrência"
          options={[
              {value: 'none', label: 'Não repete'},
              {value: 'monthly', label: 'Mensal'},
              {value: 'weekly', label: 'Semanal'}
          ]}
          value={newTrans.recurrence}
          onChange={e => setNewTrans({...newTrans, recurrence: e.target.value})}
        />
        <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
};
