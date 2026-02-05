
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../Input';
import { Button } from '../Button';
import { Bot, Loader2, AlertCircle, PlayCircle, Moon, Sun } from 'lucide-react';

// Simple Google Logo Component
const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const AuthScreen: React.FC = () => {
  const { loginDemo } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      const saved = localStorage.getItem('lifesync_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('lifesync_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
            await updateProfile(userCredential.user, { displayName: name });
        }
      }
    } catch (err: any) {
      // Handle known operational errors without spamming console
      const knownErrors = [
        'auth/invalid-credential', 
        'auth/user-not-found', 
        'auth/wrong-password', 
        'auth/email-already-in-use',
        'auth/invalid-login-credentials'
      ];
      
      if (!knownErrors.includes(err.code)) {
        console.error("Auth Error:", err);
      }

      let msg = 'Ocorreu um erro ao conectar.';
      
      // Mapeamento de erros comuns
      if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(err.code)) {
        msg = 'Email ou senha incorretos. Verifique suas credenciais.';
      }
      
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Este email já está cadastrado. Tente fazer login.';
      }
      
      if (err.code === 'auth/weak-password') {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      }
      
      if (err.code === 'auth/network-request-failed') {
        msg = 'Falha na conexão. Verifique sua internet.';
      }
      
      if (err.code === 'auth/too-many-requests') {
        msg = 'Muitas tentativas. Aguarde alguns instantes.';
      }

      if (err.message && err.message.includes('INVALID_KEY')) {
        msg = 'Erro de Configuração: Chave de API do Firebase inválida.';
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        let msg = 'Não foi possível conectar com Google.';
        if (err.code === 'auth/popup-closed-by-user') msg = 'Login cancelado pelo usuário.';
        if (err.code === 'auth/cancelled-popup-request') msg = 'Solicitação cancelada.';
        if (err.code === 'auth/invalid-credential') msg = 'Erro de configuração do Firebase (Domínio não autorizado ou Chave inválida).';
        setError(msg);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg text-slate-600 dark:text-slate-300 hover:scale-110 transition-all border border-white/20 dark:border-slate-700"
        title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row animate-fadeIn border border-white/20 dark:border-slate-700 transition-colors duration-300">
        
        <div className="w-full p-8">
            <div className="text-center mb-8">
                <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
                    <Bot className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">
                    {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">
                    LifeSync AI - Finanças e Agenda Inteligente
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <Input 
                        placeholder="Seu nome" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                    />
                )}
                <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                <Input 
                    type="password" 
                    placeholder="Senha" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                />

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-start border border-red-100 dark:border-red-800">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <Button className="w-full py-3 text-base font-semibold shadow-indigo-200 dark:shadow-none" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entrar' : 'Cadastrar')}
                </Button>
            </form>

            <div className="my-6 flex items-center justify-between gap-2">
                 <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                 <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Ou acesse com</span>
                 <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            </div>

            <div className="space-y-3">
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full py-3 text-base border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 dark:text-white relative flex items-center justify-center font-medium"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <GoogleLogo />
                    <span className="text-slate-700 dark:text-slate-200">Google</span>
                </Button>

                <Button 
                    type="button" 
                    onClick={loginDemo}
                    className="w-full py-3 text-base bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/40 flex items-center justify-center shadow-none font-medium transition-colors"
                >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Modo Visitante (Demo)
                </Button>
            </div>

            <div className="mt-8 text-center">
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
                >
                    {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem conta? Faça Login'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
