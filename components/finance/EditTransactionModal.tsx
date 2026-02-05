import React, { useState } from 'react';
import { Transaction, Category } from '../../types';
import { Input, Select } from '../Input';
import { Button } from '../Button';
import { X } from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onSave: (t: Transaction) => void;
  onCancel: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, categories, onSave, onCancel }) => {
  const [editTrans, setEditTrans] = useState({
    ...transaction,
    date: new Date(transaction.date).toISOString().split('T')[0] // Format for input date
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...editTrans,
      amount: Number(editTrans.amount),
      date: new Date(editTrans.date).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Editar Transação</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Descrição" 
            required
            value={editTrans.description}
            onChange={e => setEditTrans({...editTrans, description: e.target.value})}
          />
          <Input 
            label="Valor (R$)" 
            type="number" 
            step="0.01" 
            required
            value={editTrans.amount}
            onChange={e => setEditTrans({...editTrans, amount: Number(e.target.value)})}
          />
          <Select 
            label="Tipo"
            options={[{value: 'expense', label: 'Despesa'}, {value: 'income', label: 'Receita'}]}
            value={editTrans.type}
            onChange={e => setEditTrans({...editTrans, type: e.target.value as any})}
          />
          <Select 
            label="Categoria"
            options={categories.map(c => ({value: c.name, label: c.name}))}
            value={editTrans.category}
            onChange={e => setEditTrans({...editTrans, category: e.target.value})}
          />
          <Input 
            label="Data" 
            type="date" 
            required
            value={editTrans.date}
            onChange={e => setEditTrans({...editTrans, date: e.target.value})}
          />
          <Select 
              label="Recorrência"
              options={[
                  {value: 'none', label: 'Não repete'},
                  {value: 'monthly', label: 'Mensal'},
                  {value: 'weekly', label: 'Semanal'}
              ]}
              value={editTrans.recurrence || 'none'}
              onChange={e => setEditTrans({...editTrans, recurrence: e.target.value as any})}
          />
          <div className="md:col-span-2 flex justify-end space-x-2 mt-4 border-t pt-4 border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};