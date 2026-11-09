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
import { categoryAllowed, useCodeCategories } from '../catalog/categories.ts'
import { codeTypeOptions, type MedicalCodeType } from '../catalog/types.ts'
import { dollarsToCents } from '../catalog/money.ts'
import type { RuleDefinition, RuleInput } from './types.ts'

type RuleFormDialogProps = {
  open: boolean
  rule: RuleDefinition | null
  onClose: () => void
  onSubmit: (input: RuleInput) => Promise<void>
}

function valuesFrom(rule: RuleDefinition | null) {
  return {
    name: rule?.name ?? '',
    description: rule?.description ?? '',
    codeType: rule?.codeType ?? '',
    code: rule?.code ?? '',
    category: rule?.category ?? '',
    fee: rule ? (rule.minFeeCents / 100).toFixed(2) : '',
    enabled: rule?.enabled ?? true,
  }
}

export function RuleFormDialog({ open, rule, onClose, onSubmit }: RuleFormDialogProps) {
  const editing = rule !== null
  const [form, setForm] = useState(() => valuesFrom(rule))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { procedureCategories, diagnosisCategories, error: categoryError, loading } = useCodeCategories(open, 'both')

  function update(field: 'name' | 'description' | 'code' | 'category' | 'fee', value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function changeCodeType(codeType: string) {
    setForm((current) => ({
      ...current,
      codeType,
      category: categoryAllowed(codeType, current.category, procedureCategories, diagnosisCategories, loading)
        ? current.category
        : '',
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const minFeeCents = dollarsToCents(form.fee.trim())
    if (minFeeCents === null) {
      setError('Enter a minimum fee of zero dollars or more.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        codeType: form.codeType === '' ? null : (form.codeType as MedicalCodeType),
        code: form.code.trim() === '' ? null : form.code.trim(),
        category: form.category.trim() === '' ? null : form.category.trim(),
        minFeeCents,
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
        <DialogTitle>{editing ? 'Edit rule' : 'Add rule'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error || categoryError ? <Alert severity="error">{error ?? categoryError}</Alert> : null}
            <TextField label="Name" value={form.name} onChange={(event) => update('name', event.target.value)} required autoFocus fullWidth />
            <TextField label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} required fullWidth multiline minRows={2} />
            <TextField select label="Code type" value={form.codeType} onChange={(event) => changeCodeType(event.target.value)} fullWidth>
              <MenuItem value="">Any</MenuItem>
              {codeTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <CategoryField
              value={form.category}
              onChange={(category) => update('category', category)}
              loading={loading}
              categories={form.codeType === 'ICD10' ? diagnosisCategories : form.codeType === '' ? undefined : procedureCategories}
              groups={form.codeType === '' ? [
                { label: 'Procedures', categories: procedureCategories },
                { label: 'Diagnoses', categories: diagnosisCategories },
              ] : undefined}
            />
            <TextField label="Code" value={form.code} onChange={(event) => update('code', event.target.value)} fullWidth helperText="Leave blank to match every code." />
            <TextField label="Minimum fee (USD)" value={form.fee} onChange={(event) => update('fee', event.target.value)} required fullWidth type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} />
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
