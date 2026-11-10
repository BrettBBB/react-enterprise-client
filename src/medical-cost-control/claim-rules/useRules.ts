import type { GridGetRowsParams } from '@mui/x-data-grid'
import { useCallback, useState } from 'react'
import { errorMessage } from '../../api/client.ts'
import {
  createRule as createRuleRequest,
  deleteRule as deleteRuleRequest,
  listRules,
  updateRule as updateRuleRequest,
} from './rules-api.ts'
import type { RuleGridPage, RuleInput } from './types.ts'

export function useRules() {
  const [error, setError] = useState<string | null>(null)

  const getRows = useCallback(async (params: GridGetRowsParams): Promise<RuleGridPage> => {
    try {
      const page = await listRules(params)
      setError(null)
      return page
    } catch (caught) {
      setError(errorMessage(caught, 'Could not load rules'))
      throw caught
    }
  }, [])

  return {
    error,
    getRows,
    createRule: useCallback((input: RuleInput) => createRuleRequest(input), []),
    updateRule: useCallback((id: string, input: RuleInput) => updateRuleRequest(id, input), []),
    deleteRule: useCallback(async (id: string) => {
      await deleteRuleRequest(id)
    }, []),
  }
}
