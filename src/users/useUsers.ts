import { useCallback, useEffect, useState } from 'react';
import {
  createUser as createUserRequest,
  deleteUser as deleteUserRequest,
  listUsers,
  updateUser as updateUserRequest,
} from './users-api.ts';
import type { User, UserInput } from './types.ts';

function byNewest(users: User[]) {
  return [...users].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

function messageFrom(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

export function useUsers(enabled: boolean) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    listUsers()
      .then((rows) => {
        if (!cancelled) {
          setUsers(byNewest(rows));
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(messageFrom(caught, 'Could not load users'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, requestId]);

  const createUser = useCallback(async (input: UserInput) => {
    const created = await createUserRequest(input);
    setUsers((current) => byNewest([...current, created]));
    return created;
  }, []);

  const updateUser = useCallback(async (id: string, input: UserInput) => {
    const updated = await updateUserRequest(id, input);
    setUsers((current) =>
      current.map((user) => (user.id === id ? updated : user)),
    );
    return updated;
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    await deleteUserRequest(id);
    setUsers((current) => current.filter((user) => user.id !== id));
  }, []);

  return { users, loading, error, refresh, createUser, updateUser, deleteUser };
}
