import type { GridGetRowsParams } from '@mui/x-data-grid'
import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import { withDollarFilters } from '../catalog/money.ts'
import type { RuleDefinition, RuleGridPage, RuleInput } from './types.ts'

const rules = apiResources.ruleDefinitions

export function listRules(params: GridGetRowsParams) {
  const grid = encodeURIComponent(JSON.stringify(withDollarFilters(params, ['minFeeCents'])))
  return api<RuleGridPage>(rules, `?grid=${grid}`)
}

export function createRule(input: RuleInput) {
  return api<RuleDefinition>(rules, '', { method: 'POST', body: JSON.stringify(input) })
}

export function updateRule(id: string, input: RuleInput) {
  return api<RuleDefinition>(rules, encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteRule(id: string) {
  return api<RuleDefinition>(rules, encodeURIComponent(id), { method: 'DELETE' })
}
