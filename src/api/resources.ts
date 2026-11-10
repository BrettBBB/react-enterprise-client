/** Paths appended to VITE_API_URL. Add a resource here when the API gains a new address. */
export const apiResources = {
  auth: '/auth',
  users: '/users',
  procedureCodes: '/procedure-codes',
  procedureRules: '/procedure-rules',
  diagnosisCodes: '/diagnosis-codes',
  diagnosisRules: '/diagnosis-rules',
  claims: '/claims',
  claimRules: '/claim-rules',
  email: '/email',
} as const

export type ApiResource = (typeof apiResources)[keyof typeof apiResources]
