import { expect, test } from 'vitest'
import type { GridGetRowsParams } from '@mui/x-data-grid'
import { dollarsToCents, formatFee, withDollarFilters } from './money.ts'

test('formats cents as dollars', () => {
  expect(formatFee(12800)).toBe('$128.00')
})

test('rounds a dollar amount to cents', () => {
  expect(dollarsToCents('12.5')).toBe(1250)
  expect(dollarsToCents('-1')).toBeNull()
})

test('sends fee filters to the database in cents', () => {
  const params = {
    filterModel: { items: [{ field: 'feeCents', operator: '>=', value: 12.5 }] },
  } as GridGetRowsParams

  expect(withDollarFilters(params, ['feeCents']).filterModel?.items).toEqual([
    { field: 'feeCents', operator: '>=', value: 1250 },
  ])
})
