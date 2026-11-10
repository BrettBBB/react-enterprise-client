import CircularProgress from '@mui/material/CircularProgress'
import type { GridLoadingOverlayProps } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'

const wakeDelayMs = 700

export function DatabaseWakeOverlay({ style }: GridLoadingOverlayProps) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), wakeDelayMs)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="db-wake-overlay" style={style} role="status">
      <CircularProgress size={36} />
      <p className="db-wake-title">{slow ? 'The sample database is waking up' : 'Loading'}</p>
      {slow ? (
        <p className="db-wake-copy">
          Neon Postgres sleeps when it is idle. This first request can take a few seconds.
        </p>
      ) : null}
    </div>
  )
}

export const databaseWakeGridProps = {
  slots: { loadingOverlay: DatabaseWakeOverlay },
  slotProps: {
    loadingOverlay: {
      variant: 'circular-progress' as const,
      noRowsVariant: 'circular-progress' as const,
    },
  },
}
