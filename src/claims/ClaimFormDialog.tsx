import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState, type FormEvent } from 'react'
import { errorMessage } from '../api/client.ts'
import { dollarsToCents } from '../catalog/money.ts'
import { codeTypeOptions, type MedicalCodeType } from '../catalog/types.ts'
import type { Claim, ClaimInput } from './types.ts'

type ClaimFormDialogProps = {
  open: boolean
  claim: Claim | null
  onClose: () => void
  onSubmit: (input: ClaimInput) => Promise<void>
}

function valuesFrom(claim: Claim | null) {
  return {
    claimNumber: claim?.claimNumber ?? '',
    codeType: (claim?.codeType ?? 'CPT') as MedicalCodeType,
    code: claim?.code ?? '',
    serviceDate: claim?.serviceDate.slice(0, 10) ?? '',
    fee: claim ? (claim.billedCents / 100).toFixed(2) : '',
  }
}

export function ClaimFormDialog({ open, claim, onClose, onSubmit }: ClaimFormDialogProps) {
  const editing = claim !== null
  const [form, setForm] = useState(() => valuesFrom(claim))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof ReturnType<typeof valuesFrom>, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const billedCents = dollarsToCents(form.fee.trim())
    if (billedCents === null) {
      setError('Enter a billed amount of zero dollars or more.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        claimNumber: form.claimNumber.trim(),
        codeType: form.codeType,
        code: form.code.trim(),
        serviceDate: form.serviceDate,
        billedCents,
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
        <DialogTitle>{editing ? 'Edit claim' : 'Add claim'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField label="Claim number" value={form.claimNumber} onChange={(event) => update('claimNumber', event.target.value)} required autoFocus fullWidth />
            <TextField select label="Code type" value={form.codeType} onChange={(event) => update('codeType', event.target.value)} required fullWidth>
              {codeTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Code" value={form.code} onChange={(event) => update('code', event.target.value)} required fullWidth helperText="Must already exist in the code catalog." />
            <TextField label="Service date" value={form.serviceDate} onChange={(event) => update('serviceDate', event.target.value)} required fullWidth type="date" slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Billed amount (USD)" value={form.fee} onChange={(event) => update('fee', event.target.value)} required fullWidth type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} />
            {editing ? <TextField label="Outcome" value={claim.outcome} disabled fullWidth /> : null}
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
