'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken } from '@/lib/token';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Read token from cookie on mount
    const savedToken = getToken();
    if (savedToken) {
      setTokenState(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, userData: User) => {
    setToken(newToken);        // writes to cookie
    setTokenState(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeToken();             // deletes cookie
    setTokenState(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
