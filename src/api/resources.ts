/** Paths appended to VITE_API_URL. Add a resource here when the API gains a new address. */
export const apiResources = {
  auth: '/auth',
  users: '/users',
} as const

export type ApiResource = (typeof apiResources)[keyof typeof apiResources]
