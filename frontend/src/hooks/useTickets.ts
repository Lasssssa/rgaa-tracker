import { useCallback, useEffect, useState } from 'react'
import { ticketsApi } from '../api'
import type { Ticket, TicketInput } from '../types'

export function useTickets(projectId: number) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTickets(await ticketsApi.list(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    reload()
  }, [reload])

  const createTicket = useCallback(
    async (data: TicketInput) => {
      const created = await ticketsApi.create(projectId, data)
      setTickets((prev) => [created, ...prev])
      return created
    },
    [projectId],
  )

  const updateTicket = useCallback(async (id: number, data: TicketInput) => {
    const updated = await ticketsApi.update(id, data)
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [])

  const toggleTicket = useCallback(async (id: number) => {
    const updated = await ticketsApi.toggle(id)
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [])

  const removeTicket = useCallback(async (id: number) => {
    await ticketsApi.remove(id)
    setTickets((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    tickets,
    loading,
    error,
    setError,
    reload,
    createTicket,
    updateTicket,
    toggleTicket,
    removeTicket,
  }
}
