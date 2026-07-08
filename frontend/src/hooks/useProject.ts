import { useEffect, useState } from 'react'
import { projectsApi } from '../api'
import type { Project } from '../types'

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const projectId = Number(id)
    if (!Number.isInteger(projectId)) {
      setError('Identifiant de projet invalide')
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    projectsApi
      .get(projectId)
      .then((data) => {
        if (active) setProject(data)
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
  }, [id])

  return { project, loading, error }
}
