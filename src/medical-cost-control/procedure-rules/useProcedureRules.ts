import type { GridGetRowsParams } from '@mui/x-data-grid'
import { useCallback, useState } from 'react'
import { errorMessage } from '../../api/client.ts'
import {
  createProcedureRule as createProcedureRuleRequest,
  deleteProcedureRule as deleteProcedureRuleRequest,
  listProcedureRules,
  updateProcedureRule as updateProcedureRuleRequest,
} from './procedure-rules-api.ts'
import type { ProcedureRuleGridPage, ProcedureRuleInput } from './types.ts'

export function useProcedureRules() {
  const [error, setError] = useState<string | null>(null)

  const getRows = useCallback(async (params: GridGetRowsParams): Promise<ProcedureRuleGridPage> => {
    try {
      const page = await listProcedureRules(params)
      setError(null)
      return page
    } catch (caught) {
      setError(errorMessage(caught, 'Could not load procedure rules'))
      throw caught
    }
  }, [])

  return {
    error,
    getRows,
    createProcedureRule: useCallback((input: ProcedureRuleInput) => createProcedureRuleRequest(input), []),
    updateProcedureRule: useCallback((id: string, input: ProcedureRuleInput) => updateProcedureRuleRequest(id, input), []),
    deleteProcedureRule: useCallback(async (id: string) => {
      await deleteProcedureRuleRequest(id)
    }, []),
  }
}
