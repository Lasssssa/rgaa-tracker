import { useCallback, useEffect, useState } from 'react'
import { pagesApi } from '../api'
import type { Page, PageInput } from '../types'

export function usePages(projectId: number) {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPages(await pagesApi.list(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    reload()
  }, [reload])

  const createPage = useCallback(
    async (data: PageInput) => {
      const created = await pagesApi.create(projectId, data)
      // Pages are listed in creation order, so append at the end.
      setPages((prev) => [...prev, created])
      return created
    },
    [projectId],
  )

  const updatePage = useCallback(async (id: number, data: PageInput) => {
    const updated = await pagesApi.update(id, data)
    setPages((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  const removePage = useCallback(async (id: number) => {
    await pagesApi.remove(id)
    setPages((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return {
    pages,
    loading,
    error,
    setError,
    reload,
    createPage,
    updatePage,
    removePage,
  }
}
