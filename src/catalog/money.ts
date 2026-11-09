import type { GridFilterItem, GridGetRowsParams } from '@mui/x-data-grid'

export function formatFee(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function formatDollars(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function dollarsToCents(value: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) {
    return null
  }
  return Math.round(amount * 100)
}

export function parseDollars(value: string) {
  const cents = dollarsToCents(value)
  return cents === null ? null : cents / 100
}

/** Column filters are typed in dollars. The database stores cents. */
export function withDollarFilters(params: GridGetRowsParams, fields: readonly string[]) {
  const items = params.filterModel?.items
  if (!items) {
    return params
  }
  const money = new Set(fields)
  return {
    ...params,
    filterModel: {
      ...params.filterModel,
      items: items.map((item) => convertMoneyItem(item, money)),
    },
  }
}

function convertMoneyItem(item: GridFilterItem, fields: Set<string>): GridFilterItem {
  if (!fields.has(item.field) || item.value == null || item.value === '') {
    return item
  }
  if (Array.isArray(item.value)) {
    return { ...item, value: item.value.map((entry) => cents(entry)) }
  }
  return { ...item, value: cents(item.value) }
}

function cents(value: unknown) {
  const amount = dollarsToCents(String(value))
  if (amount == null) {
    throw new Error('Enter a fee of zero dollars or more.')
  }
  return amount
}
