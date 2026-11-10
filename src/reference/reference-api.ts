import type { GridGetRowsParams } from '@mui/x-data-grid'
import { api } from '../api/client.ts'
import { apiResources, type ApiResource } from '../api/resources.ts'
import { clearDiagnosisCategories, clearProcedureCategories } from '../medical-cost-control/categories.ts'
import type { DiagnosisCode, GridPage, ProcedureCode } from './types.ts'

function list<T>(resource: ApiResource, params: GridGetRowsParams) {
  return api<GridPage<T>>(resource, `?grid=${encodeURIComponent(JSON.stringify(params))}`)
}

export function listProcedureCodes(params: GridGetRowsParams) {
  return list<ProcedureCode>(apiResources.procedureCodes, params)
}

export function listDiagnosisCodes(params: GridGetRowsParams) {
  return list<DiagnosisCode>(apiResources.diagnosisCodes, params)
}

export async function importProcedureCodes() {
  const result = await api<{ imported: number }>(apiResources.procedureCodes, 'import', { method: 'POST' })
  clearProcedureCategories()
  return result
}

export async function importDiagnosisCodes() {
  const result = await api<{ imported: number }>(apiResources.diagnosisCodes, 'import', { method: 'POST' })
  clearDiagnosisCategories()
  return result
}
