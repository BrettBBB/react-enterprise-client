import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState, type FormEvent } from 'react'
import { errorMessage } from '../api/client.ts'
import { CategoryField } from '../catalog/CategoryField.tsx'
import { useCodeCategories } from '../catalog/categories.ts'
import { parseDollars } from '../catalog/money.ts'
import type { ProcedureRule, ProcedureRuleInput } from './types.ts'

const procedureTypeOptions = [
  { value: 'CPT', label: 'CPT' },
  { value: 'HCPCS', label: 'HCPCS' },
] as const

type ProcedureRuleFormDialogProps = {
  open: boolean
  rule: ProcedureRule | null
  onClose: () => void
  onSubmit: (input: ProcedureRuleInput) => Promise<void>
}

function valuesFrom(rule: ProcedureRule | null) {
  return {
    name: rule?.name ?? '',
    description: rule?.description ?? '',
    codeType: rule?.codeType ?? '',
    code: rule?.code ?? '',
    category: rule?.category ?? '',
    cost: rule ? rule.minStandardCost.toFixed(2) : '',
    enabled: rule?.enabled ?? true,
  }
}

export function ProcedureRuleFormDialog({ open, rule, onClose, onSubmit }: ProcedureRuleFormDialogProps) {
  const editing = rule !== null
  const [form, setForm] = useState(() => valuesFrom(rule))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { procedureCategories, error: categoryError, loading } = useCodeCategories(open, 'procedure')

  function update(field: 'name' | 'description' | 'codeType' | 'code' | 'category' | 'cost', value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const minStandardCost = parseDollars(form.cost.trim())
    if (minStandardCost === null) {
      setError('Enter a minimum standard cost of zero dollars or more.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        codeType: form.codeType === '' ? null : (form.codeType as ProcedureRuleInput['codeType']),
        code: form.code.trim() === '' ? null : form.code.trim(),
        category: form.category.trim() === '' ? null : form.category.trim(),
        minStandardCost,
        enabled: form.enabled,
      })
    } catch (caught) {
      setError(errorMessage(caught, 'Save failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogTitle>{editing ? 'Edit procedure rule' : 'Add procedure rule'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error || categoryError ? <Alert severity="error">{error ?? categoryError}</Alert> : null}
            <TextField label="Name" value={form.name} onChange={(event) => update('name', event.target.value)} required autoFocus fullWidth />
            <TextField label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} required fullWidth multiline minRows={2} />
            <TextField select label="Code type" value={form.codeType} onChange={(event) => update('codeType', event.target.value)} fullWidth>
              <MenuItem value="">Any</MenuItem>
              {procedureTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <CategoryField value={form.category} onChange={(category) => update('category', category)} categories={procedureCategories} loading={loading} />
            <TextField label="Code" value={form.code} onChange={(event) => update('code', event.target.value)} fullWidth helperText="Leave blank to match every code." />
            <TextField label="Minimum standard cost (USD)" value={form.cost} onChange={(event) => update('cost', event.target.value)} required fullWidth type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} />
            <FormControlLabel control={<Checkbox checked={form.enabled} onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} />} label="Enabled" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Stack>
    </Dialog>
  )
}
