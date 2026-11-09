import type { GridGetRowsParams, GridGetRowsResponse } from '@mui/x-data-grid'
import { useCallback, useState } from 'react'
import { errorMessage } from '../api/client.ts'

export function useReference<T>(
  load: (params: GridGetRowsParams) => Promise<GridGetRowsResponse>,
  fallback: string,
) {
  const [error, setError] = useState<string | null>(null)

  const getRows = useCallback(
    async (params: GridGetRowsParams) => {
      try {
        const page = await load(params)
        setError(null)
        return page as GridGetRowsResponse & { rows: T[] }
      } catch (caught) {
        setError(errorMessage(caught, fallback))
        throw caught
      }
    },
    [fallback, load],
  )

  return { error, getRows }
}
