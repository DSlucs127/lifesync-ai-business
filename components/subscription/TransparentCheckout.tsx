
import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input, Select } from '../Input';
import { CreditCard, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { PlanTier, PLAN_CONFIGS } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TransparentCheckoutProps {
  plan: PlanTier;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

// Relative path works because frontend and backend are on same origin now
const BACKEND_URL = ''; 

export const TransparentCheckout: React.FC<TransparentCheckoutProps> = ({ plan, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const planInfo = PLAN_CONFIGS[plan];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    securityCode: '',
    identificationType: 'CPF',
    identificationNumber: ''
  });

  // Carregar script do Mercado Pago
  useEffect(() => {
      const script = document.createElement('script');
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      document.body.appendChild(script);
      return () => {
          document.body.removeChild(script);
      }
  }, []);

  useEffect(() => {
    const num = formData.cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) setCardBrand('visa');
    else if (num.startsWith('5')) setCardBrand('mastercard');
    else if (num.startsWith('3')) setCardBrand('amex');
    else setCardBrand(null);
  }, [formData.cardNumber]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // @ts-ignore
      if (!window.MercadoPago) {
          throw new Error("SDK do Mercado Pago não carregou.");
      }
      
      // @ts-ignore
      // Coloque sua PUBLIC KEY aqui (pode ser hardcoded no frontend, é seguro)
      const mp = new window.MercadoPago('TEST-33923a1a-4934-46c5-8422-921473210452');

      // 1. Criar Token do Cartão
      const cardTokenResponse = await mp.createCardToken({
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardholderName: formData.cardholderName,
          cardExpirationMonth: formData.expiryMonth,
          cardExpirationYear: formData.expiryYear,
          securityCode: formData.securityCode,
          identification: {
              type: formData.identificationType,
              number: formData.identificationNumber
          }
      });

      // 2. Enviar Token para o Backend Criar Assinatura
      // Usando path relativo '/api/subscribe'
      const response = await fetch(`${BACKEND_URL}/api/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: user?.uid,
              email: user?.email,
              plan: plan,
              cardToken: cardTokenResponse.id
          })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || 'Erro no processamento');
      }

      onSuccess(data.id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar pagamento. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
      return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-slideInRight">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-slate-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-indigo-600" /> Assinatura Segura
            </h3>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" /> MP 256-bit
            </span>
          </div>
          <p className="text-sm text-slate-500">Plano selecionado: <span className="font-bold text-slate-900">{planInfo.label}</span></p>
      </div>

      <form onSubmit={handlePay} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          
          {/* Visual Cartão */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden mb-6">
              <div className="flex justify-between items-start mb-8">
                  <div className="w-10 h-7 bg-slate-700 rounded border border-slate-600"></div>
                  {cardBrand && <span className="font-bold uppercase tracking-wider">{cardBrand}</span>}
              </div>
              <div className="text-xl font-mono tracking-widest mb-4 min-h-[1.75rem]">
                  {formData.cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-end text-xs opacity-70">
                  <span>{formData.cardholderName || 'NOME DO TITULAR'}</span>
                  <span>{formData.expiryMonth}/{formData.expiryYear}</span>
              </div>
          </div>

          <div className="space-y-4">
              <Input 
                label="Número do Cartão" 
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={e => setFormData({...formData, cardNumber: formatCardNumber(e.target.value)})}
                required
              />

              <Input 
                label="Nome do Titular" 
                placeholder="Como no cartão"
                value={formData.cardholderName}
                onChange={e => setFormData({...formData, cardholderName: e.target.value.toUpperCase()})}
                required
              />

              <div className="grid grid-cols-3 gap-4">
                  <Input label="Mês" placeholder="MM" maxLength={2} value={formData.expiryMonth} onChange={e => setFormData({...formData, expiryMonth: e.target.value})} required />
                  <Input label="Ano" placeholder="YY" maxLength={2} value={formData.expiryYear} onChange={e => setFormData({...formData, expiryYear: e.target.value})} required />
                  <Input label="CVV" placeholder="123" maxLength={4} type="password" value={formData.securityCode} onChange={e => setFormData({...formData, securityCode: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <Select 
                    label="Documento"
                    options={[{value: 'CPF', label: 'CPF'}, {value: 'CNPJ', label: 'CNPJ'}]}
                    value={formData.identificationType}
                    onChange={e => setFormData({...formData, identificationType: e.target.value})}
                  />
                  <Input 
                    label="Número" 
                    placeholder="Somente números"
                    value={formData.identificationNumber}
                    onChange={e => setFormData({...formData, identificationNumber: e.target.value})}
                    required
                  />
              </div>
          </div>

          {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start border border-red-100">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                  <span>{error}</span>
              </div>
          )}
      </form>

      <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium">Recorrência Mensal:</span>
              <span className="text-2xl font-black text-slate-900">R$ {planInfo.price.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={loading}>Voltar</Button>
              <Button className="flex-1 py-3 text-lg bg-indigo-600 hover:bg-indigo-700" onClick={handlePay} disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Assinar
              </Button>
          </div>
      </div>
    </div>
  );
};
