'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { AuthUser } from '@/lib/firebase';
import { fetchCurrentUser, logout as apiLogout } from '@/lib/firebase';
import LoginModal from './LoginModal';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;            // opens modal
  logout: () => Promise<void>;
  requireAuth: () => boolean;    // returns true if logged in, opens modal if not
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  requireAuth: () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(() => setShowLogin(true), []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setShowLogin(true);
    return false;
  }, [user]);

  const handleLoginSuccess = useCallback((u: AuthUser) => {
    setUser(u);
    setShowLogin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, requireAuth }}>
      {children}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </AuthContext.Provider>
  );
}
