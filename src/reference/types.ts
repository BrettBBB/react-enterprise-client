import type { ClaimOutcome } from '../medical-cost-control/claims/types.ts'

export type ProcedureCode = {
  code: string
  codeType: 'CPT' | 'HCPCS'
  category: string | null
  shortDescription: string
  longDescription: string
  workRvu: number | null
  peRvu: number | null
  mpRvu: number | null
  totalRvu: number | null
  standardCost: number | null
  effectiveDate: string
  createdAt: string
  updatedAt: string
}

export type DiagnosisCode = {
  code: string
  codeType: 'ICD-10-CM'
  category: string | null
  shortDescription: string
  longDescription: string
  isBillable: boolean
  requires7thCharacter: boolean
  laterality: string | null
  episodeOfCare: boolean
  isHccEligible: boolean
  effectiveDate: string
  createdAt: string
  updatedAt: string
}

export type GridPage<T> = {
  rows: T[]
  rowCount: number
}

export type Flag = ClaimOutcome
