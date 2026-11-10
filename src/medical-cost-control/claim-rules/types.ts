import type { MedicalCodeType } from '../types.ts'

export type RuleDefinition = {
  id: string
  name: string
  description: string
  codeType: MedicalCodeType | null
  code: string | null
  category: string | null
  minFeeCents: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type RuleInput = {
  name: string
  description: string
  codeType: MedicalCodeType | null
  code: string | null
  category: string | null
  minFeeCents: number
  enabled: boolean
}

export type RuleGridPage = {
  rows: RuleDefinition[]
  rowCount: number
}
