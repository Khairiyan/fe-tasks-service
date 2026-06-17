// A tiny external store for the JWT, backed by localStorage.
// Designed for React's useSyncExternalStore: SSR snapshot is always null,
// the client snapshot reads the real token after hydration.
import { clearToken, getToken, setToken } from "./api";

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const tokenStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = () => emit();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): string | null {
    return getToken();
  },
  getServerSnapshot(): string | null {
    return null;
  },
  set(token: string) {
    setToken(token);
    emit();
  },
  clear() {
    clearToken();
    emit();
  },
};
