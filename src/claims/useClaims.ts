import type { GridGetRowsParams } from '@mui/x-data-grid'
import { useCallback, useState } from 'react'
import { errorMessage } from '../api/client.ts'
import {
  createClaim as createClaimRequest,
  deleteClaim as deleteClaimRequest,
  listClaims,
  updateClaim as updateClaimRequest,
} from './claims-api.ts'
import type { ClaimGridPage, ClaimInput } from './types.ts'

export function useClaims() {
  const [error, setError] = useState<string | null>(null)

  const getRows = useCallback(async (params: GridGetRowsParams): Promise<ClaimGridPage> => {
    try {
      const page = await listClaims(params)
      setError(null)
      return page
    } catch (caught) {
      setError(errorMessage(caught, 'Could not load claims'))
      throw caught
    }
  }, [])

  return {
    error,
    getRows,
    createClaim: useCallback((input: ClaimInput) => createClaimRequest(input), []),
    updateClaim: useCallback((id: string, input: ClaimInput) => updateClaimRequest(id, input), []),
    deleteClaim: useCallback(async (id: string) => {
      await deleteClaimRequest(id)
    }, []),
  }
}
