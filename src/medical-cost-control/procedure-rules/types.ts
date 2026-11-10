export type ProcedureRule = {
  id: string
  name: string
  description: string
  codeType: 'CPT' | 'HCPCS' | null
  code: string | null
  category: string | null
  minStandardCost: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type ProcedureRuleInput = {
  name: string
  description: string
  codeType: 'CPT' | 'HCPCS' | null
  code: string | null
  category: string | null
  minStandardCost: number
  enabled: boolean
}

export type ProcedureRuleGridPage = {
  rows: ProcedureRule[]
  rowCount: number
}
