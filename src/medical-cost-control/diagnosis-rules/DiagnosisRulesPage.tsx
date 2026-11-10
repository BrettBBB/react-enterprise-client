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
import { useAuth } from '../../auth/auth-context.ts'
import { DiagnosisRuleFormDialog } from './DiagnosisRuleFormDialog.tsx'
import type { DiagnosisRule, DiagnosisRuleInput } from './types.ts'
import { useDiagnosisRules } from './useDiagnosisRules.ts'

export function DiagnosisRulesPage() {
  const { user } = useAuth()
  const canChange = user?.isAdmin === true
  const apiRef = useGridApiRef()
  const { error, getRows, createDiagnosisRule, updateDiagnosisRule, deleteDiagnosisRule } = useDiagnosisRules()
  const dataSource = useMemo<GridDataSource>(() => ({ getRows }), [getRows])
  const [editing, setEditing] = useState<DiagnosisRule | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<DiagnosisRule | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function reload() {
    apiRef.current?.dataSource.cache.clear()
    await apiRef.current?.dataSource.fetchRows()
  }

  const columns = useMemo<GridColDef<DiagnosisRule>[]>(
    () => {
      const fields: GridColDef<DiagnosisRule>[] = [
      { field: 'name', headerName: 'Rule', flex: 1, minWidth: 180 },
      { field: 'description', headerName: 'Description', flex: 1.6, minWidth: 240 },
      { field: 'category', headerName: 'Category', flex: 1, minWidth: 160 },
      { field: 'code', headerName: 'Code', width: 110 },
      { field: 'laterality', headerName: 'Laterality', width: 120 },
      { field: 'requireHccEligible', headerName: 'Requires HCC', type: 'boolean', width: 140 },
      { field: 'enabled', headerName: 'Enabled', type: 'boolean', width: 110 },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        width: 110,
        renderCell: ({ row }) => (
          <Stack direction="row">
            <IconButton aria-label={`Edit ${row.name}`} onClick={() => setEditing(row)}>
              <EditIcon />
            </IconButton>
            <IconButton aria-label={`Delete ${row.name}`} onClick={() => setPendingDelete(row)}>
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

  async function saveRule(input: DiagnosisRuleInput) {
    setActionError(null)
    if (editing) {
      await updateDiagnosisRule(editing.id, input)
      setEditing(null)
    } else {
      await createDiagnosisRule(input)
      setCreating(false)
    }
    await reload()
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteDiagnosisRule(pendingDelete.id)
      setPendingDelete(null)
      await reload()
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
            An ICD-10 claim is flagged when the diagnosis matches the code, category, laterality, and HCC requirement on the rule. Blank fields match every diagnosis. Saving a rule scores every claim again.
          </Typography>
          {canChange ? (
            <Button className="page-action" variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>Add rule</Button>
          ) : null}
        </Stack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {actionError ? <Alert severity="error">{actionError}</Alert> : null}
        <Box sx={{ flex: 1, minHeight: 420 }}>
          <DataGrid
            apiRef={apiRef}
            columns={columns}
            dataSource={dataSource}
            pagination
            filterDebounceMs={300}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 25 } },
              sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
            }}
            disableRowSelectionOnClick
            showToolbar
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>
      </Stack>
      <DiagnosisRuleFormDialog
        key={editing?.id ?? (creating ? 'create' : 'idle')}
        open={creating || editing !== null}
        rule={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSubmit={saveRule}
      />
      <Dialog open={pendingDelete !== null} onClose={deleting ? undefined : () => setPendingDelete(null)}>
        <DialogTitle>Delete diagnosis rule</DialogTitle>
        <DialogContent>
          <DialogContentText>Delete {pendingDelete?.name}? Claims are scored again without it.</DialogContentText>
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
