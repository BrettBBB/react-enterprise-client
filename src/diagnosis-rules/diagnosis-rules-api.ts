import type { GridGetRowsParams } from '@mui/x-data-grid'
import { api } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'
import type { DiagnosisRule, DiagnosisRuleGridPage, DiagnosisRuleInput } from './types.ts'

const rules = apiResources.diagnosisRules

export function listDiagnosisRules(params: GridGetRowsParams) {
  return api<DiagnosisRuleGridPage>(rules, `?grid=${encodeURIComponent(JSON.stringify(params))}`)
}

export function createDiagnosisRule(input: DiagnosisRuleInput) {
  return api<DiagnosisRule>(rules, '', { method: 'POST', body: JSON.stringify(input) })
}

export function updateDiagnosisRule(id: string, input: DiagnosisRuleInput) {
  return api<DiagnosisRule>(rules, encodeURIComponent(id), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteDiagnosisRule(id: string) {
  return api<DiagnosisRule>(rules, encodeURIComponent(id), { method: 'DELETE' })
}
