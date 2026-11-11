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
import { formatDollars } from '../money.ts'
import { ProcedureRuleFormDialog } from './ProcedureRuleFormDialog.tsx'
import type { ProcedureRule, ProcedureRuleInput } from './types.ts'
import { useProcedureRules } from './useProcedureRules.ts'

const procedureTypes = ['CPT', 'HCPCS'] as const

export function ProcedureRulesPage() {
  const { user } = useAuth()
  const canChange = user?.isAdmin === true
  const apiRef = useGridApiRef()
  const { error, getRows, createProcedureRule, updateProcedureRule, deleteProcedureRule } = useProcedureRules()
  const dataSource = useMemo<GridDataSource>(() => ({ getRows }), [getRows])
  const [editing, setEditing] = useState<ProcedureRule | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ProcedureRule | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function reload() {
    apiRef.current?.dataSource.cache.clear()
    await apiRef.current?.dataSource.fetchRows()
  }

  const columns = useMemo<GridColDef<ProcedureRule>[]>(
    () => {
      const fields: GridColDef<ProcedureRule>[] = [
      { field: 'name', headerName: 'Rule', flex: 1, minWidth: 180 },
      { field: 'description', headerName: 'Description', flex: 1.6, minWidth: 240 },
      { field: 'codeType', headerName: 'Type', type: 'singleSelect', valueOptions: [...procedureTypes], width: 110 },
      { field: 'category', headerName: 'Category', flex: 1, minWidth: 160 },
      { field: 'code', headerName: 'Code', width: 110 },
      {
        field: 'minStandardCost',
        headerName: 'Minimum cost',
        type: 'number',
        width: 140,
        valueFormatter: (value: number | null | undefined) => (value == null ? '' : formatDollars(value)),
      },
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

  async function saveRule(input: ProcedureRuleInput) {
    setActionError(null)
    const action = editing ? 'updated' : 'created'
    if (editing) {
      await updateProcedureRule(editing.id, input)
      setEditing(null)
    } else {
      await createProcedureRule(input)
      setCreating(false)
    }
    await reload()
    if (isPostHogEnabled) {
      posthog.capture('procedure_rule_saved', {
        action,
        enabled: input.enabled,
        code_type: input.codeType ?? 'any',
      })
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteProcedureRule(pendingDelete.id)
      setPendingDelete(null)
      await reload()
      if (isPostHogEnabled) {
        posthog.capture('procedure_rule_deleted')
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
            A CPT or HCPCS claim is flagged when that procedure&apos;s standard cost meets the minimum and any type, category, or code on the rule also matches. Blank fields match every procedure. Saving a rule scores every claim again.
          </Typography>
          {canChange ? (
            <Button className="page-action" variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>Add rule</Button>
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
              sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
            }}
            disableRowSelectionOnClick
            showToolbar
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>
      </Stack>
      <ProcedureRuleFormDialog
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
        <DialogTitle>Delete procedure rule</DialogTitle>
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
