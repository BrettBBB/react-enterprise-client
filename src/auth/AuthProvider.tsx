import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readAccessToken, storeAccessToken } from '../api/session.ts';
import { login as loginRequest, register as registerRequest } from './auth-api.ts';
import type { User, UserInput } from '../users/types.ts';
import { AuthContext, type AuthContextValue } from './auth-context.ts';

const storageKey = 'enterprise.session';

function readSession(): User | null {
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<User>;
    if (!parsed.id || typeof parsed.isAdmin !== 'boolean') {
      sessionStorage.removeItem(storageKey);
      storeAccessToken(null);
      return null;
    }
    return parsed as User;
  } catch {
    sessionStorage.removeItem(storageKey);
    return null;
  }
}

function storeSession(user: User | null, accessToken?: string | null) {
  if (user) {
    sessionStorage.setItem(storageKey, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(storageKey);
  }
  if (user === null) {
    storeAccessToken(null);
    return;
  }
  if (accessToken !== undefined) {
    storeAccessToken(accessToken);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginRequest(email, password);
    storeSession(next.user, next.accessToken);
    setUser(next.user);
  }, []);

  const register = useCallback(async (input: UserInput) => {
    const next = await registerRequest(input);
    storeSession(next.user, next.accessToken);
    setUser(next.user);
  }, []);

  const logout = useCallback(() => {
    storeSession(null, null);
    setUser(null);
  }, []);

  const replaceSession = useCallback((next: User) => {
    storeSession(next, readAccessToken());
    setUser(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, register, logout, replaceSession }),
    [user, login, register, logout, replaceSession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
