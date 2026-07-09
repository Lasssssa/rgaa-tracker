import { useEffect, useState } from 'react'
import { criteriaApi } from '../api'
import type { CriterionListItem } from '../types'

export function useCriteriaList() {
  const [criteria, setCriteria] = useState<CriterionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    criteriaApi
      .listCriteria()
      .then((data) => {
        if (active) setCriteria(data)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Chargement impossible')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { criteria, loading, error }
}
