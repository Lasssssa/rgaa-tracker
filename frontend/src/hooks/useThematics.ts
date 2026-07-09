import { useEffect, useState } from 'react'
import { criteriaApi } from '../api'
import type { Thematic } from '../types'

export function useThematics() {
  const [thematics, setThematics] = useState<Thematic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    criteriaApi
      .listThematics()
      .then((data) => {
        if (active) setThematics(data)
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

  return { thematics, loading, error }
}
