import type { GridGetRowsParams } from '@mui/x-data-grid'
import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import type { ProcedureRule, ProcedureRuleGridPage, ProcedureRuleInput } from './types.ts'

const rules = apiResources.procedureRules

export function listProcedureRules(params: GridGetRowsParams) {
  return api<ProcedureRuleGridPage>(rules, `?grid=${encodeURIComponent(JSON.stringify(params))}`)
}

export function createProcedureRule(input: ProcedureRuleInput) {
  return api<ProcedureRule>(rules, '', { method: 'POST', body: JSON.stringify(input) })
}

export function updateProcedureRule(id: string, input: ProcedureRuleInput) {
  return api<ProcedureRule>(rules, encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteProcedureRule(id: string) {
  return api<ProcedureRule>(rules, encodeURIComponent(id), { method: 'DELETE' })
}
