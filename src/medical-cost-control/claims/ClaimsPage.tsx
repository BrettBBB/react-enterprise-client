import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, useGridApiRef, type GridColDef, type GridDataSource } from '@mui/x-data-grid'
import { useMemo, useState } from 'react'
import { errorMessage } from '../../api/client.ts'
import { databaseWakeGridProps } from '../../shell/DatabaseWakeOverlay.tsx'
import { useAuth } from '../../auth/auth-context.ts'
import posthog, { isPostHogEnabled } from '../../posthog.ts'
import { formatFee } from '../money.ts'
import { codeTypeOptions } from '../types.ts'
import { ClaimFormDialog } from './ClaimFormDialog.tsx'
import { claimOutcomes, type Claim, type ClaimInput } from './types.ts'
import { useClaims } from './useClaims.ts'

function formatServiceDate(value: string | Date | null | undefined) {
  if (value == null || value === '') return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
}

export function ClaimsPage() {
  const { user } = useAuth()
  const canChange = user?.isAdmin === true
  const apiRef = useGridApiRef()
  const { error, getRows, createClaim, updateClaim, deleteClaim } = useClaims()
  const dataSource = useMemo<GridDataSource>(() => ({ getRows }), [getRows])
  const [editing, setEditing] = useState<Claim | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Claim | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function reload() {
    apiRef.current?.dataSource.cache.clear()
    await apiRef.current?.dataSource.fetchRows()
  }

  const columns = useMemo<GridColDef<Claim>[]>(
    () => {
      const fields: GridColDef<Claim>[] = [
      { field: 'claimNumber', headerName: 'Claim', width: 140 },
      {
        field: 'codeType',
        headerName: 'Type',
        type: 'singleSelect',
        valueOptions: [...codeTypeOptions],
        width: 110,
      },
      { field: 'code', headerName: 'Code', width: 110 },
      { field: 'category', headerName: 'Category', flex: 1, minWidth: 160 },
      { field: 'description', headerName: 'Description', flex: 1.4, minWidth: 220 },
      {
        field: 'serviceDate',
        headerName: 'Service date',
        type: 'date',
        width: 140,
        valueGetter: (value: string | null) => (value ? new Date(value) : null),
        valueFormatter: (value: Date | string | null) => formatServiceDate(value),
      },
      {
        field: 'billedCents',
        headerName: 'Billed',
        type: 'number',
        width: 130,
        valueFormatter: (value: number | null | undefined) => (value == null ? '' : formatFee(value)),
      },
      {
        field: 'outcome',
        headerName: 'Outcome',
        type: 'singleSelect',
        valueOptions: [...claimOutcomes],
        width: 140,
      },
      {
        field: 'procedureFlag',
        headerName: 'Procedure',
        type: 'singleSelect',
        valueOptions: [...claimOutcomes],
        width: 140,
      },
      {
        field: 'diagnosisFlag',
        headerName: 'Diagnosis',
        type: 'singleSelect',
        valueOptions: [...claimOutcomes],
        width: 140,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        width: 110,
        renderCell: ({ row }) => (
          <Stack direction="row">
            <IconButton aria-label={`Edit ${row.claimNumber}`} onClick={() => setEditing(row)}>
              <EditIcon />
            </IconButton>
            <IconButton aria-label={`Delete ${row.claimNumber}`} onClick={() => setPendingDelete(row)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        ),
      },
      ]
      return canChange ? fields : fields.filter((column) => column.field !== 'actions')
    },
    [canChange],
  )

  async function saveClaim(input: ClaimInput) {
    setActionError(null)
    const action = editing ? 'updated' : 'created'
    if (editing) {
      await updateClaim(editing.id, input)
      setEditing(null)
    } else {
      await createClaim(input)
      setCreating(false)
    }
    await reload()
    if (isPostHogEnabled) {
      posthog.capture('claim_saved', { action, code_type: input.codeType })
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteClaim(pendingDelete.id)
      setPendingDelete(null)
      await reload()
      if (isPostHogEnabled) {
        posthog.capture('claim_deleted', { code_type: pendingDelete.codeType })
      }
    } catch (caught) {
      setActionError(errorMessage(caught, 'Delete failed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Stack className="page-actions" direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Typography color="text.secondary">
            Filter outcome, procedure, or diagnosis to TRIGGERED or PASSED. Billed-amount filters are dollars. Each page is requested from <code>GET /claims</code>.
          </Typography>
          {canChange ? (
            <Button className="page-action" variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>Add claim</Button>
          ) : null}
        </Stack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {actionError ? <Alert severity="error">{actionError}</Alert> : null}
        <Box sx={{ flex: 1, minHeight: 420 }}>
          <DataGrid
            {...databaseWakeGridProps}
            apiRef={apiRef}
            columns={columns}
            dataSource={dataSource}
            pagination
            filterDebounceMs={300}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 25 } },
              sorting: { sortModel: [{ field: 'billedCents', sort: 'desc' }] },
            }}
            disableRowSelectionOnClick
            showToolbar
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>
      </Stack>
      <ClaimFormDialog
        key={editing?.id ?? (creating ? 'create' : 'idle')}
        open={creating || editing !== null}
        claim={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={saveClaim}
      />
      <Dialog open={pendingDelete !== null} onClose={deleting ? undefined : () => setPendingDelete(null)}>
        <DialogTitle>Delete claim</DialogTitle>
        <DialogContent>
          <DialogContentText>Delete {pendingDelete?.claimNumber}?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
