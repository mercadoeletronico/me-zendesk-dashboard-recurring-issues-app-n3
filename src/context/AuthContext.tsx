'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSession } from '@/auth/session';
import { initiateLogin, handleCallback, logout as authLogout } from '@/auth';
import type { AuthUser } from '@/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const code   = params.get('code');
      const state  = params.get('state');
      const error  = params.get('error');

      if (error) {
        console.error('[Auth] OAuth error:', error, params.get('error_description'));
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(false);
        return;
      }

      if (code && state) {
        const success = await handleCallback(code, state);
        window.history.replaceState({}, document.title, window.location.pathname);
        if (success) {
          const session = getSession();
          if (session) setUser(session.user);
        }
        setIsLoading(false);
        return;
      }

      const session = getSession();
      if (session) setUser(session.user);
      setIsLoading(false);
    }

    init();
  }, []);

  const login  = useCallback(async () => { await initiateLogin(); }, []);
  const logout = useCallback(() => { setUser(null); authLogout(); }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
