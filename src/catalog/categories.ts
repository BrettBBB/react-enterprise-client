import { useEffect, useState } from 'react'
import { api, errorMessage } from '../api/client.ts'
import { apiResources } from '../api/resources.ts'

type CategoryList = 'procedure' | 'diagnosis' | 'both'

let procedureCategories: Promise<string[]> | null = null
let diagnosisCategories: Promise<string[]> | null = null

function loadCategories(resource: typeof apiResources.procedureCodes | typeof apiResources.diagnosisCodes) {
  return api<{ categories: string[] }>(resource, 'categories').then((page) => page.categories)
}

export function loadProcedureCategories() {
  procedureCategories ??= loadCategories(apiResources.procedureCodes).catch((error: unknown) => {
    procedureCategories = null
    throw error
  })
  return procedureCategories
}

export function loadDiagnosisCategories() {
  diagnosisCategories ??= loadCategories(apiResources.diagnosisCodes).catch((error: unknown) => {
    diagnosisCategories = null
    throw error
  })
  return diagnosisCategories
}

export function clearProcedureCategories() {
  procedureCategories = null
}

export function clearDiagnosisCategories() {
  diagnosisCategories = null
}

export function categoryAllowed(
  codeType: string,
  category: string,
  procedures: readonly string[],
  diagnoses: readonly string[],
  loading: boolean,
) {
  if (category === '' || loading) {
    return true
  }
  if (codeType === 'ICD10') {
    return diagnoses.includes(category)
  }
  if (codeType === 'CPT' || codeType === 'HCPCS') {
    return procedures.includes(category)
  }
  return procedures.includes(category) || diagnoses.includes(category)
}

export function useCodeCategories(open: boolean, which: CategoryList) {
  const [procedureCategories, setProcedureCategories] = useState<string[]>([])
  const [diagnosisCategories, setDiagnosisCategories] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    let active = true
    const requests: Promise<void>[] = []
    if (which === 'procedure' || which === 'both') {
      requests.push(loadProcedureCategories().then((categories) => {
        if (active) setProcedureCategories(categories)
      }))
    }
    if (which === 'diagnosis' || which === 'both') {
      requests.push(loadDiagnosisCategories().then((categories) => {
        if (active) setDiagnosisCategories(categories)
      }))
    }
    Promise.all(requests)
      .then(() => {
        if (active) setError(null)
      })
      .catch((caught: unknown) => {
        if (active) setError(errorMessage(caught, 'Could not load categories'))
      })
      .finally(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [open, which])

  return { procedureCategories, diagnosisCategories, error, loading: open && !loaded }
}
