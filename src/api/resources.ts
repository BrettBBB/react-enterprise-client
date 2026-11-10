/** Paths appended to VITE_API_URL. Add a resource here when the API gains a new address. */
export const apiResources = {
  auth: '/auth',
  users: '/users',
  procedureCodes: '/procedure-codes',
  diagnosisCodes: '/diagnosis-codes',
  claimRules: '/claim-rules',
  procedureRules: '/procedure-rules',
  diagnosisRules: '/diagnosis-rules',
  claims: '/claims',
  email: '/email',
} as const

export type ApiResource = (typeof apiResources)[keyof typeof apiResources]
