import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, clearAccessToken, getAccessToken, setAccessToken } from '../lib/api';

const AuthContext = createContext(null);

const initialSession = {
  status: 'checking',
  user: null,
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(initialSession);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setSession({ status: 'unauthenticated', user: null });
  }, []);

  const applySession = useCallback((nextSession) => {
    setAccessToken(nextSession.accessToken);
    setSession({ status: 'authenticated', user: nextSession.user });
    return nextSession.user;
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        if (getAccessToken()) {
          const { user } = await authApi.me();
          if (active) setSession({ status: 'authenticated', user });
          return;
        }

        const nextSession = await authApi.refresh();
        if (active) applySession(nextSession);
      } catch {
        if (active) clearSession();
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (credentials) => {
      const nextSession = await authApi.login(credentials);
      return applySession(nextSession);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload) => {
      const nextSession = await authApi.register(payload);
      return applySession(nextSession);
    },
    [applySession],
  );

  const refreshSession = useCallback(async () => {
    const nextSession = await authApi.refresh();
    return applySession(nextSession);
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Local logout should still complete if the API is unavailable.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      clearSession,
      isAuthenticated: session.status === 'authenticated',
      isLoading: session.status === 'checking',
      login,
      logout,
      refreshSession,
      register,
      status: session.status,
      user: session.user,
    }),
    [clearSession, login, logout, refreshSession, register, session.status, session.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
