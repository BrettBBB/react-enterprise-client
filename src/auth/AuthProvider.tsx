import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readAccessToken } from '../api/session.ts';
import {
  login as loginRequest,
  logoutRequest,
  register as registerRequest,
  type AuthResult,
} from './auth-api.ts';
import type { User, UserInput } from '../users/types.ts';
import { AuthContext, type AuthContextValue } from './auth-context.ts';
import {
  readSession,
  storeSession,
  subscribeSessionExpired,
  subscribeSessionRefreshed,
} from './session.ts';
import { useRefreshOnExpiry } from './useRefreshOnExpiry.ts';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession);

  const remember = useCallback((next: AuthResult) => {
    storeSession(next.user, next.accessToken, next.refreshExpiresAt);
    setUser(next.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    remember(await loginRequest(email, password));
  }, [remember]);

  const register = useCallback(async (input: UserInput) => {
    remember(await registerRequest(input));
  }, [remember]);

  const logout = useCallback(() => {
    void logoutRequest().catch(() => undefined);
    storeSession(null, null);
    setUser(null);
  }, []);

  useEffect(() => subscribeSessionExpired(() => setUser(null)), []);

  useEffect(
    () =>
      subscribeSessionRefreshed(() => {
        const next = readSession();
        if (next) {
          setUser(next);
        }
      }),
    [],
  );

  useRefreshOnExpiry(user, logout);

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
