import { useCallback, useEffect, useState } from 'react'
import { issuesApi } from '../api'
import type { Issue, IssueInput } from '../types'

export function useIssues(projectId: number) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setIssues(await issuesApi.list(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    reload()
  }, [reload])

  const createIssue = useCallback(
    async (data: IssueInput) => {
      const created = await issuesApi.create(projectId, data)
      setIssues((prev) => [created, ...prev])
      return created
    },
    [projectId],
  )

  const updateIssue = useCallback(
    async (id: number, data: Partial<IssueInput>) => {
      const updated = await issuesApi.update(id, data)
      setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)))
      return updated
    },
    [],
  )

  const removeIssue = useCallback(async (id: number) => {
    await issuesApi.remove(id)
    setIssues((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return {
    issues,
    loading,
    error,
    setError,
    reload,
    createIssue,
    updateIssue,
    removeIssue,
  }
}
