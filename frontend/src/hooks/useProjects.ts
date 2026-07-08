import { useCallback, useEffect, useState } from 'react'
import { projectsApi } from '../api'
import type { Project, ProjectInput } from '../types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProjects(await projectsApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const createProject = useCallback(async (data: ProjectInput) => {
    const created = await projectsApi.create(data)
    setProjects((prev) => [created, ...prev])
    return created
  }, [])

  const updateProject = useCallback(
    async (id: number, data: ProjectInput) => {
      const updated = await projectsApi.update(id, data)
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return updated
    },
    [],
  )

  const removeProject = useCallback(async (id: number) => {
    await projectsApi.remove(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return {
    projects,
    loading,
    error,
    setError,
    reload,
    createProject,
    updateProject,
    removeProject,
  }
}
