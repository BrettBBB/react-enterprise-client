import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState, type FormEvent } from 'react'
import { errorMessage } from '../api/client.ts'
import { CategoryField } from '../catalog/CategoryField.tsx'
import { useCodeCategories } from '../catalog/categories.ts'
import type { DiagnosisRule, DiagnosisRuleInput } from './types.ts'

type DiagnosisRuleFormDialogProps = {
  open: boolean
  rule: DiagnosisRule | null
  onClose: () => void
  onSubmit: (input: DiagnosisRuleInput) => Promise<void>
}

function valuesFrom(rule: DiagnosisRule | null) {
  return {
    name: rule?.name ?? '',
    description: rule?.description ?? '',
    code: rule?.code ?? '',
    category: rule?.category ?? '',
    laterality: rule?.laterality ?? '',
    requireHccEligible: rule?.requireHccEligible ?? false,
    enabled: rule?.enabled ?? true,
  }
}

export function DiagnosisRuleFormDialog({ open, rule, onClose, onSubmit }: DiagnosisRuleFormDialogProps) {
  const editing = rule !== null
  const [form, setForm] = useState(() => valuesFrom(rule))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { diagnosisCategories, error: categoryError, loading } = useCodeCategories(open, 'diagnosis')

  function update(field: 'name' | 'description' | 'code' | 'category' | 'laterality', value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        code: form.code.trim() === '' ? null : form.code.trim(),
        category: form.category.trim() === '' ? null : form.category.trim(),
        laterality: form.laterality.trim() === '' ? null : form.laterality.trim(),
        requireHccEligible: form.requireHccEligible,
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
        <DialogTitle>{editing ? 'Edit diagnosis rule' : 'Add diagnosis rule'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error || categoryError ? <Alert severity="error">{error ?? categoryError}</Alert> : null}
            <TextField label="Name" value={form.name} onChange={(event) => update('name', event.target.value)} required autoFocus fullWidth />
            <TextField label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} required fullWidth multiline minRows={2} />
            <CategoryField value={form.category} onChange={(category) => update('category', category)} categories={diagnosisCategories} loading={loading} />
            <TextField label="Code" value={form.code} onChange={(event) => update('code', event.target.value)} fullWidth helperText="Leave blank to match every code." />
            <TextField label="Laterality" value={form.laterality} onChange={(event) => update('laterality', event.target.value)} fullWidth helperText="Leave blank to match every laterality." />
            <FormControlLabel control={<Checkbox checked={form.requireHccEligible} onChange={(event) => setForm((current) => ({ ...current, requireHccEligible: event.target.checked }))} />} label="Requires HCC eligibility" />
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
