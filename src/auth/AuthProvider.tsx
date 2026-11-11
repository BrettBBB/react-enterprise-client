import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { readAccessToken } from '../api/session.ts';
import posthog, { isPostHogEnabled } from '../posthog.ts';
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

function identifyUser(user: User) {
  if (isPostHogEnabled) {
    posthog.identify(user.id, {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.isAdmin ? 'admin' : 'member',
    });
  }
}

function resetPostHog() {
  if (isPostHogEnabled) {
    posthog.reset();
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession);
  const initialUser = useRef(user);

  const remember = useCallback((next: AuthResult) => {
    if (user && user.id !== next.user.id) {
      resetPostHog();
    }
    storeSession(next.user, next.accessToken, next.refreshExpiresAt);
    identifyUser(next.user);
    setUser(next.user);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    remember(await loginRequest(email, password));
    if (isPostHogEnabled) {
      posthog.capture('user_signed_in');
      posthog.logger.info('authentication completed', { operation: 'sign_in' });
    }
  }, [remember]);

  const register = useCallback(async (input: UserInput) => {
    remember(await registerRequest(input));
    if (isPostHogEnabled) {
      posthog.capture('user_registered');
      posthog.logger.info('authentication completed', { operation: 'registration' });
    }
  }, [remember]);

  const logout = useCallback(() => {
    void logoutRequest().catch(() => undefined);
    resetPostHog();
    storeSession(null, null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (initialUser.current) {
      identifyUser(initialUser.current);
      initialUser.current = null;
    }
  }, []);

  useEffect(
    () =>
      subscribeSessionExpired(() => {
        if (user) {
          resetPostHog();
        }
        setUser(null);
      }),
    [user],
  );

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
