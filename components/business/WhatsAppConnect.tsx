
import React from 'react';
import { Button } from '../Button';
import { AlertCircle, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface WhatsAppConnectProps {
    onClose: () => void;
}

export const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ onClose }) => {
    // Em produção, isso viria das variáveis de ambiente ou configurações do usuário
    const webhookUrl = "https://SEU-CLOUD-RUN-URL.a.run.app/api/webhook/whatsapp";

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-emerald-100 p-3 rounded-full">
                        <LinkIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Conexão WhatsApp Business</h2>
                        <p className="text-sm text-slate-500">Integração via Webhook (Serverless)</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Seu Webhook URL</h4>
                        <div className="flex gap-2">
                            <code className="flex-1 bg-white border border-slate-200 p-3 rounded-lg text-xs font-mono text-slate-600 break-all">
                                {webhookUrl}
                            </code>
                            <Button size="sm" onClick={() => navigator.clipboard.writeText(webhookUrl)}>Copiar</Button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Configure esta URL no seu provedor (Evolution API, Z-API ou Meta Business).
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600">O bot responderá automaticamente usando a IA Gemini.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600">Histórico de conversas salvo automaticamente no CRM.</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                        <p className="text-xs text-yellow-700">
                            Para o deploy no Google Cloud Run, certifique-se de configurar as variáveis de ambiente <code>API_KEY</code> e <code>FIREBASE_CREDENTIALS</code> no painel do GCP.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={onClose}>Entendi</Button>
                </div>
            </div>
        </div>
    );
};
