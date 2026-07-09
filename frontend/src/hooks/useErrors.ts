import { useCallback, useEffect, useState } from 'react'
import { errorsApi } from '../api'
import type { ProjectError, ErrorInput } from '../types'

export function useErrors(projectId: number) {
  const [errors, setErrors] = useState<ProjectError[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setErrors(await errorsApi.list(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    reload()
  }, [reload])

  const createError = useCallback(
    async (data: ErrorInput) => {
      const created = await errorsApi.create(projectId, data)
      setErrors((prev) => [created, ...prev])
      return created
    },
    [projectId],
  )

  const updateError = useCallback(async (id: number, data: ErrorInput) => {
    const updated = await errorsApi.update(id, data)
    setErrors((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [])

  const toggleError = useCallback(async (id: number) => {
    const updated = await errorsApi.toggle(id)
    setErrors((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [])

  const removeError = useCallback(async (id: number) => {
    await errorsApi.remove(id)
    setErrors((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    errors,
    loading,
    error,
    setError,
    reload,
    createError,
    updateError,
    toggleError,
    removeError,
  }
}
