import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminApi } from '../api/admin';
import type { AdminUser, Permission } from '../api/types';

interface AuthState {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  /** True when the signed-in user's role grants the permission. */
  can: (permission: Permission) => boolean;
  /** Replace the cached admin after profile/preference updates. */
  setAdmin: (admin: AdminUser) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdminState] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .me()
      .then((res) => {
        if (!cancelled) setAdminState(res.admin);
      })
      .catch(() => {
        if (!cancelled) setAdminState(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminApi.login(email, password);
    setAdminState(res.admin);
    return res.admin;
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout().catch(() => {});
    setAdminState(null);
  }, []);

  const can = useCallback(
    (permission: Permission) => admin?.permissions.includes(permission) ?? false,
    [admin],
  );

  const setAdmin = useCallback((next: AdminUser) => setAdminState(next), []);

  const value = useMemo(
    () => ({ admin, loading, login, logout, can, setAdmin }),
    [admin, loading, login, logout, can, setAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
