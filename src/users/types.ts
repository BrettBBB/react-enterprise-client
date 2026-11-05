export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  age?: number;
};

/** MUI X `GridGetRowsResponse` for this grid. */
export type UserGridPage = {
  rows: User[];
  rowCount: number;
};
