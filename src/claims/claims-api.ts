import type { GridGetRowsParams } from '@mui/x-data-grid'
import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import { withDollarFilters } from '../catalog/money.ts'
import type { Claim, ClaimGridPage, ClaimInput } from './types.ts'

const claims = apiResources.claims

export function listClaims(params: GridGetRowsParams) {
  const grid = encodeURIComponent(JSON.stringify(withDollarFilters(params, ['billedCents'])))
  return api<ClaimGridPage>(claims, `?grid=${grid}`)
}

export function createClaim(input: ClaimInput) {
  return api<Claim>(claims, '', { method: 'POST', body: JSON.stringify(input) })
}

export function updateClaim(id: string, input: ClaimInput) {
  return api<Claim>(claims, encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteClaim(id: string) {
  return api<Claim>(claims, encodeURIComponent(id), { method: 'DELETE' })
}
