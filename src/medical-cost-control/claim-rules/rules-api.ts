import type { GridGetRowsParams } from '@mui/x-data-grid'
import { api } from '../../api/client.ts'
import { apiResources } from '../../api/resources.ts'
import { withDollarFilters } from '../money.ts'
import type { RuleDefinition, RuleGridPage, RuleInput } from './types.ts'

const claimRules = apiResources.claimRules

export function listRules(params: GridGetRowsParams) {
  const grid = encodeURIComponent(JSON.stringify(withDollarFilters(params, ['minFeeCents'])))
  return api<RuleGridPage>(claimRules, `?grid=${grid}`)
}

export function createRule(input: RuleInput) {
  return api<RuleDefinition>(claimRules, '', { method: 'POST', body: JSON.stringify(input) })
}

export function updateRule(id: string, input: RuleInput) {
  return api<RuleDefinition>(claimRules, encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteRule(id: string) {
  return api<RuleDefinition>(claimRules, encodeURIComponent(id), { method: 'DELETE' })
}
