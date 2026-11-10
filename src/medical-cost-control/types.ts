export const medicalCodeTypes = ['CPT', 'ICD10', 'HCPCS'] as const

export type MedicalCodeType = (typeof medicalCodeTypes)[number]

export const codeTypeOptions = [
  { value: 'CPT', label: 'CPT' },
  { value: 'ICD10', label: 'ICD-10' },
  { value: 'HCPCS', label: 'HCPCS' },
] as const

export type MedicalCode = {
  id: string
  code: string
  codeType: MedicalCodeType
  description: string
  category: string
  feeCents: number
  createdAt: string
  updatedAt: string
}

export type MedicalCodeInput = {
  code: string
  codeType: MedicalCodeType
  description: string
  category: string
  feeCents: number
}

export type MedicalCodeGridPage = {
  rows: MedicalCode[]
  rowCount: number
}
