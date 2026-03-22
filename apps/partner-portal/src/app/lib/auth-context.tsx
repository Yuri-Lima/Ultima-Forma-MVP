import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  setCredentials,
  getCredentials,
  clearCredentials,
  isAuthenticated as checkAuth,
} from './api';

interface AuthContextValue {
  isAuthenticated: boolean;
  partnerId: string | null;
  login: (partnerId: string, clientSecret: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  partnerId: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(checkAuth);
  const [partnerId, setPartnerId] = useState<string | null>(
    () => getCredentials()?.partnerId ?? null
  );

  const login = useCallback((pid: string, secret: string) => {
    setCredentials({ partnerId: pid, clientSecret: secret });
    setPartnerId(pid);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearCredentials();
    setPartnerId(null);
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: authenticated, partnerId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
