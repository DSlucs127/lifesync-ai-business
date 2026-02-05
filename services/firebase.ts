
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Helper para acessar variáveis de ambiente de forma segura
const getEnv = (key: string, fallback: string) => {
  try {
    // Verifica se import.meta.env existe (Vite)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || fallback;
    }
  } catch (e) {
    console.warn("Environment variables not accessible, using fallback.");
  }
  return fallback;
};

/**
 * Configurações oficiais do Firebase.
 * O ideal é usar variáveis de ambiente (Vite/Next) para segurança.
 * Se essas chaves falharem, use o MODO DEMO na tela de login.
 */
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyC8jVoFYUN8xxP_6u5H35R2cGU14xZBI_0"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "gen-lang-client-0215687695.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "gen-lang-client-0215687695"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "gen-lang-client-0215687695.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "840386391433"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:840386391433:web:dea15ba69cb48b5ac00558"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-L5504M7ETD")
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta instâncias para uso global
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
