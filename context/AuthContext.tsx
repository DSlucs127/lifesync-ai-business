
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  loginDemo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
      if (user?.uid === 'demo-user') {
          setUser(null);
          return;
      }
      return firebaseSignOut(auth);
  };

  const loginDemo = () => {
    // Cria um usuário mock para permitir o uso do app sem backend
    const demoUser = {
      uid: 'demo-user',
      email: 'demo@lifesync.ai',
      displayName: 'Visitante Demo',
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'demo-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
    } as unknown as User;
    
    setUser(demoUser);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginDemo }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
