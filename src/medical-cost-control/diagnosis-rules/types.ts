export type DiagnosisRule = {
  id: string
  name: string
  description: string
  code: string | null
  category: string | null
  laterality: string | null
  requireHccEligible: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type DiagnosisRuleInput = {
  name: string
  description: string
  code: string | null
  category: string | null
  laterality: string | null
  requireHccEligible: boolean
  enabled: boolean
}

export type DiagnosisRuleGridPage = {
  rows: DiagnosisRule[]
  rowCount: number
}
