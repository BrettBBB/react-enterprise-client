import { useCallback, useState } from 'react';
import type { GridGetRowsParams } from '@mui/x-data-grid';
import {
  createUser as createUserRequest,
  deleteUser as deleteUserRequest,
  listUsers,
  updateUser as updateUserRequest,
} from './users-api.ts';
import type { UserGridPage, UserInput } from './types.ts';

function messageFrom(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

export function useUsers() {
  const [error, setError] = useState<string | null>(null);

  const getRows = useCallback(async (params: GridGetRowsParams): Promise<UserGridPage> => {
    try {
      const page = await listUsers(params);
      setError(null);
      return page;
    } catch (caught) {
      setError(messageFrom(caught, 'Could not load users'));
      throw caught;
    }
  }, []);

  const createUser = useCallback(async (input: UserInput) => {
    return createUserRequest(input);
  }, []);

  const updateUser = useCallback(async (id: string, input: UserInput) => {
    return updateUserRequest(id, input);
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    await deleteUserRequest(id);
  }, []);

  return { error, getRows, createUser, updateUser, deleteUser };
}
