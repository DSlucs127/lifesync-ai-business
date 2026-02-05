import React, { useState } from 'react';
import { Button } from '../../Button';
import { Input, Select } from '../../Input';
import { ArrowRight, Home, Car, DollarSign, Target } from 'lucide-react';

export interface AdvisorFormData {
  income: string;
  goal: string;
  housingType: 'rent' | 'own' | 'other' | 'undisclosed';
  housingCost: string;
  vehicleStatus: 'yes' | 'no' | 'undisclosed';
  vehicleCost: string;
}

interface AdvisorFormProps {
  onSubmit: (data: AdvisorFormData) => void;
}

export const AdvisorForm: React.FC<AdvisorFormProps> = ({ onSubmit }) => {
  const [data, setData] = useState<AdvisorFormData>({
    income: '',
    goal: '',
    housingType: 'rent',
    housingCost: '',
    vehicleStatus: 'no',
    vehicleCost: ''
  });

  const [housingUndisclosed, setHousingUndisclosed] = useState(false);
  const [vehicleUndisclosed, setVehicleUndisclosed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...data,
        housingType: housingUndisclosed ? 'undisclosed' : data.housingType,
        housingCost: housingUndisclosed ? '0' : data.housingCost,
        vehicleStatus: vehicleUndisclosed ? 'undisclosed' : data.vehicleStatus,
        vehicleCost: vehicleUndisclosed ? '0' : data.vehicleCost
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-50">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 md:space-y-8 custom-scrollbar">
            <div className="text-center space-y-2 px-2">
                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4 shadow-sm">
                    <DollarSign className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Vamos calibrar seu perfil</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                    Preencha os dados abaixo. Quanto mais preciso, melhor será o plano financeiro da IA.
                </p>
            </div>

            {/* Renda e Objetivo */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold mb-2">
                    <div className="p-1.5 bg-emerald-50 rounded-lg"><Target className="w-4 h-4" /></div>
                    <span>Básico</span>
                </div>
                <Input 
                    label="Renda Mensal (Pessoal ou Familiar)"
                    placeholder="Ex: 5000"
                    type="number"
                    value={data.income}
                    onChange={e => setData({...data, income: e.target.value})}
                    required
                    inputMode="numeric"
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo Financeiro</label>
                    <textarea 
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-base md:text-sm resize-none h-24"
                        placeholder="Ex: Juntar R$ 10k para emergência..."
                        value={data.goal}
                        onChange={e => setData({...data, goal: e.target.value})}
                    ></textarea>
                </div>
            </div>

            {/* Moradia */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-indigo-700 font-semibold mb-2">
                     <div className="p-1.5 bg-indigo-50 rounded-lg"><Home className="w-4 h-4" /></div>
                    <span>Moradia</span>
                </div>
                
                <Select 
                    label="Situação atual"
                    options={[
                        {value: 'rent', label: 'Aluguel'},
                        {value: 'own', label: 'Casa Própria / Financiada'},
                        {value: 'other', label: 'Moro com pais / Outro'}
                    ]}
                    value={data.housingType}
                    onChange={e => setData({...data, housingType: e.target.value as any})}
                    disabled={housingUndisclosed}
                />

                {!housingUndisclosed && data.housingType !== 'other' && (
                    <Input 
                        label="Custo Mensal (Aluguel ou Parcela)"
                        placeholder="Ex: 1500"
                        type="number"
                        value={data.housingCost}
                        onChange={e => setData({...data, housingCost: e.target.value})}
                        inputMode="numeric"
                    />
                )}

                <label className="flex items-center space-x-3 text-sm text-slate-600 cursor-pointer py-2 hover:bg-slate-50 rounded-lg transition-colors -ml-2 px-2">
                    <input 
                        type="checkbox" 
                        checked={housingUndisclosed} 
                        onChange={e => setHousingUndisclosed(e.target.checked)}
                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" 
                    />
                    <span>Prefiro não dizer</span>
                </label>
            </div>

            {/* Veículo */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-blue-700 font-semibold mb-2">
                     <div className="p-1.5 bg-blue-50 rounded-lg"><Car className="w-4 h-4" /></div>
                    <span>Veículo (Carro/Moto)</span>
                </div>
                
                <Select 
                    label="Possui veículo?"
                    options={[
                        {value: 'no', label: 'Não'},
                        {value: 'yes', label: 'Sim'},
                    ]}
                    value={data.vehicleStatus}
                    onChange={e => setData({...data, vehicleStatus: e.target.value as any})}
                    disabled={vehicleUndisclosed}
                />

                {!vehicleUndisclosed && data.vehicleStatus === 'yes' && (
                    <Input 
                        label="Parcela Mensal (se houver)"
                        placeholder="Ex: 800 (Deixe 0 se quitado)"
                        type="number"
                        value={data.vehicleCost}
                        onChange={e => setData({...data, vehicleCost: e.target.value})}
                        inputMode="numeric"
                    />
                )}

                <label className="flex items-center space-x-3 text-sm text-slate-600 cursor-pointer py-2 hover:bg-slate-50 rounded-lg transition-colors -ml-2 px-2">
                    <input 
                        type="checkbox" 
                        checked={vehicleUndisclosed} 
                        onChange={e => setVehicleUndisclosed(e.target.checked)}
                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" 
                    />
                    <span>Prefiro não dizer</span>
                </label>
            </div>
        </div>

        <div className="p-4 md:p-6 bg-white border-t border-slate-200 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg py-3.5 text-base font-semibold rounded-xl" 
                disabled={!data.income}
            >
                Continuar <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
        </div>
    </form>
  );
};