import { createContext, use } from 'react';
import type { User, UserInput } from '../users/types.ts';

export type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: UserInput) => Promise<void>;
  logout: () => void;
  replaceSession: (user: User) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
