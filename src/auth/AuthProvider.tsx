import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readAccessToken } from '../api/session.ts';
import { login as loginRequest, register as registerRequest } from './auth-api.ts';
import type { User, UserInput } from '../users/types.ts';
import { AuthContext, type AuthContextValue } from './auth-context.ts';
import { readSession, storeSession } from './session.ts';

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
