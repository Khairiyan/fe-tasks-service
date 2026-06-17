"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "./token-store";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const token = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.getSnapshot,
    tokenStore.getServerSnapshot,
  );

  // Until the client has hydrated, `token` reflects the SSR snapshot (always
  // null), not what's actually in localStorage. Treat that window as "loading"
  // so route guards don't redirect on a value they can't trust yet.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const login = useCallback((newToken: string) => {
    tokenStore.set(newToken);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      // The token from localStorage is only reliable after hydration.
      isLoading: !isHydrated,
      login,
      logout,
    }),
    [token, isHydrated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
