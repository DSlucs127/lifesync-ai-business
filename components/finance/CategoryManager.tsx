import React, { useState } from 'react';
import { Category } from '../../types';
import { Plus, X } from 'lucide-react';
import { Input } from '../Input';
import { Button } from '../Button';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onClose: () => void;
  userId: string;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories, onClose, userId }) => {
  const [newCat, setNewCat] = useState('');

  const addCategory = () => {
    if (!newCat.trim()) return;
    const cat: Category = {
        id: Date.now().toString(),
        name: newCat,
        color: 'bg-indigo-100 text-indigo-800',
        userId: userId
    };
    setCategories(prev => [...prev, cat]);
    setNewCat('');
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gerenciar Categorias</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" /></button>
        </div>
        
        <div className="flex space-x-2 mb-4">
            <Input 
                placeholder="Nova categoria..." 
                value={newCat} 
                onChange={e => setNewCat(e.target.value)}
            />
            <Button onClick={addCategory} disabled={!newCat.trim()}><Plus className="w-4 h-4" /></Button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2">
            {categories.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600">
                    <span className="font-medium text-slate-700 dark:text-white">{c.name}</span>
                    <button onClick={() => removeCategory(c.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};