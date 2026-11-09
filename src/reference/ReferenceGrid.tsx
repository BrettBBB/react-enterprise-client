import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, useGridApiRef, type GridColDef, type GridDataSource, type GridValidRowModel } from '@mui/x-data-grid'
import { useMemo, useState } from 'react'
import { errorMessage } from '../api/client.ts'
import { useAuth } from '../auth/auth-context.ts'

export function ReferenceGrid<T extends GridValidRowModel>({
  note,
  columns,
  error,
  getRows,
  getRowId,
  sortField,
  onImport,
}: {
  note: string
  columns: GridColDef<T>[]
  error: string | null
  getRows: GridDataSource['getRows']
  getRowId: (row: T) => string
  sortField: string
  onImport?: () => Promise<string>
}) {
  const { user } = useAuth()
  const apiRef = useGridApiRef()
  const dataSource = useMemo<GridDataSource>(() => ({ getRows }), [getRows])
  const [notice, setNotice] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const canImport = user?.isAdmin === true && onImport != null

  async function reload() {
    apiRef.current?.dataSource.cache.clear()
    await apiRef.current?.dataSource.fetchRows()
  }

  async function importCodes() {
    if (!onImport) {
      return
    }
    setImporting(true)
    setNotice(null)
    setImportError(null)
    try {
      setNotice(await onImport())
      await reload()
    } catch (caught) {
      setImportError(errorMessage(caught, 'Import failed'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      <Stack className="page-actions" direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Typography color="text.secondary">{note}</Typography>
        {canImport ? (
          <Button className="page-action" variant="contained" disabled={importing} onClick={() => void importCodes()}>
            Import Codes
          </Button>
        ) : null}
      </Stack>
      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {importError ? <Alert severity="error">{importError}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Box sx={{ flex: 1, minHeight: 420 }}>
        <DataGrid<T>
          apiRef={apiRef}
          columns={columns}
          dataSource={dataSource}
          getRowId={getRowId}
          pagination
          filterDebounceMs={300}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 25 } },
            sorting: { sortModel: [{ field: sortField, sort: 'asc' }] },
          }}
          disableRowSelectionOnClick
          showToolbar
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>
    </Stack>
  )
}
