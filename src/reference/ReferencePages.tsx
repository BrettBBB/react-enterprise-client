import type { GridColDef } from '@mui/x-data-grid'
import { useMemo } from 'react'
import { formatDollars } from '../catalog/money.ts'
import { ReferenceGrid } from './ReferenceGrid.tsx'
import {
  importDiagnosisCodes,
  importProcedureCodes,
  listDiagnosisCodes,
  listProcedureCodes,
} from './reference-api.ts'
import type { DiagnosisCode, ProcedureCode } from './types.ts'
import { useReference } from './useReference.ts'

const procedureTypes = ['CPT', 'HCPCS'] as const

function money(value: number | null | undefined) {
  return value == null ? '' : formatDollars(value)
}

function dateLabel(value: Date | string | null) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export function ProcedureCodesPage() {
  const { error, getRows } = useReference<ProcedureCode>(listProcedureCodes, 'Could not load procedure codes')
  const columns = useMemo<GridColDef<ProcedureCode>[]>(
    () => [
      { field: 'code', headerName: 'Code', width: 110 },
      { field: 'codeType', headerName: 'Type', type: 'singleSelect', valueOptions: [...procedureTypes], width: 110 },
      { field: 'category', headerName: 'Category', flex: 1, minWidth: 160 },
      { field: 'shortDescription', headerName: 'Short description', flex: 1.4, minWidth: 220 },
      { field: 'workRvu', headerName: 'Work RVU', type: 'number', width: 110 },
      { field: 'peRvu', headerName: 'PE RVU', type: 'number', width: 110 },
      { field: 'mpRvu', headerName: 'MP RVU', type: 'number', width: 110 },
      { field: 'totalRvu', headerName: 'Total RVU', type: 'number', width: 120 },
      {
        field: 'standardCost',
        headerName: 'Standard cost',
        type: 'number',
        width: 140,
        valueFormatter: (value: number | null | undefined) => money(value),
      },
      {
        field: 'effectiveDate',
        headerName: 'Effective',
        type: 'date',
        width: 130,
        valueGetter: (value: string | null) => (value ? new Date(value) : null),
        valueFormatter: (value: Date | string | null) => dateLabel(value),
      },
    ],
    [],
  )
  return (
    <ReferenceGrid
      note="Read-only CPT and HCPCS reference data. Filters, sort, and pages are applied in the database."
      columns={columns}
      error={error}
      getRows={getRows}
      getRowId={(row) => row.code}
      sortField="code"
      onImport={async () => {
        const result = await importProcedureCodes()
        return `Imported ${result.imported} procedure codes.`
      }}
    />
  )
}

export function DiagnosisCodesPage() {
  const { error, getRows } = useReference<DiagnosisCode>(listDiagnosisCodes, 'Could not load diagnosis codes')
  const columns = useMemo<GridColDef<DiagnosisCode>[]>(
    () => [
      { field: 'code', headerName: 'Code', width: 110 },
      { field: 'category', headerName: 'Category', flex: 1, minWidth: 160 },
      { field: 'shortDescription', headerName: 'Short description', flex: 1.4, minWidth: 220 },
      { field: 'isBillable', headerName: 'Billable', type: 'boolean', width: 110 },
      { field: 'requires7thCharacter', headerName: '7th character', type: 'boolean', width: 140 },
      { field: 'laterality', headerName: 'Laterality', width: 120 },
      { field: 'episodeOfCare', headerName: 'Episode', type: 'boolean', width: 110 },
      { field: 'isHccEligible', headerName: 'HCC eligible', type: 'boolean', width: 130 },
    ],
    [],
  )
  return (
    <ReferenceGrid
      note="Read-only ICD-10-CM reference data. Filter HCC eligible to see future high-cost conditions."
      columns={columns}
      error={error}
      getRows={getRows}
      getRowId={(row) => row.code}
      sortField="code"
      onImport={async () => {
        const result = await importDiagnosisCodes()
        return `Imported ${result.imported} diagnosis codes.`
      }}
    />
  )
}
