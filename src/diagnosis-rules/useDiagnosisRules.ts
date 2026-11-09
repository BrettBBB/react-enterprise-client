import type { GridGetRowsParams } from '@mui/x-data-grid'
import { useCallback, useState } from 'react'
import { errorMessage } from '../api/client.ts'
import {
  createDiagnosisRule as createDiagnosisRuleRequest,
  deleteDiagnosisRule as deleteDiagnosisRuleRequest,
  listDiagnosisRules,
  updateDiagnosisRule as updateDiagnosisRuleRequest,
} from './diagnosis-rules-api.ts'
import type { DiagnosisRuleGridPage, DiagnosisRuleInput } from './types.ts'

export function useDiagnosisRules() {
  const [error, setError] = useState<string | null>(null)

  const getRows = useCallback(async (params: GridGetRowsParams): Promise<DiagnosisRuleGridPage> => {
    try {
      const page = await listDiagnosisRules(params)
      setError(null)
      return page
    } catch (caught) {
      setError(errorMessage(caught, 'Could not load diagnosis rules'))
      throw caught
    }
  }, [])

  return {
    error,
    getRows,
    createDiagnosisRule: useCallback((input: DiagnosisRuleInput) => createDiagnosisRuleRequest(input), []),
    updateDiagnosisRule: useCallback((id: string, input: DiagnosisRuleInput) => updateDiagnosisRuleRequest(id, input), []),
    deleteDiagnosisRule: useCallback(async (id: string) => {
      await deleteDiagnosisRuleRequest(id)
    }, []),
  }
}
