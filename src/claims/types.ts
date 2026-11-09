import type { MedicalCodeType } from '../catalog/types.ts'

export const claimOutcomes = ['TRIGGERED', 'PASSED'] as const

export type ClaimOutcome = (typeof claimOutcomes)[number]

export type Claim = {
  id: string
  claimNumber: string
  codeType: MedicalCodeType
  code: string
  category: string
  description: string
  serviceDate: string
  billedCents: number
  outcome: ClaimOutcome
  procedureFlag: ClaimOutcome
  diagnosisFlag: ClaimOutcome
  createdAt: string
  updatedAt: string
}

export type ClaimInput = {
  claimNumber: string
  codeType: MedicalCodeType
  code: string
  serviceDate: string
  billedCents: number
}

export type ClaimGridPage = {
  rows: Claim[]
  rowCount: number
}
