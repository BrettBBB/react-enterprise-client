import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import type { ReactNode } from 'react'

type CategoryGroup = {
  label: string
  categories: readonly string[]
}

type CategoryFieldProps = {
  value: string
  onChange: (value: string) => void
  categories?: readonly string[]
  groups?: readonly CategoryGroup[]
  loading?: boolean
}

export function CategoryField({ value, onChange, categories, groups, loading = false }: CategoryFieldProps) {
  const known = new Set(groups ? groups.flatMap((group) => group.categories) : categories ?? [])
  const preserved = value !== '' && !known.has(value) ? [value] : []
  const items: ReactNode[] = preserved.map((category) => (
    <MenuItem key={category} value={category}>{category}</MenuItem>
  ))
  const seen = new Set(preserved)

  if (groups) {
    for (const group of groups) {
      const options = group.categories.filter((category) => !seen.has(category))
      if (options.length === 0) continue
      options.forEach((category) => seen.add(category))
      items.push(<ListSubheader key={group.label}>{group.label}</ListSubheader>)
      options.forEach((category) => {
        items.push(<MenuItem key={`${group.label}-${category}`} value={category}>{category}</MenuItem>)
      })
    }
  } else {
    for (const category of categories ?? []) {
      if (seen.has(category)) continue
      seen.add(category)
      items.push(<MenuItem key={category} value={category}>{category}</MenuItem>)
    }
  }

  return (
    <TextField
      select
      label="Category"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      disabled={loading}
      helperText={loading ? 'Loading categories…' : 'Leave blank to match every category.'}
    >
      <MenuItem value="">Any</MenuItem>
      {items}
    </TextField>
  )
}
