import type { Ticket, TicketInput } from '../types'
import { request } from './client'

export const ticketsApi = {
  list: (projectId: number) =>
    request<Ticket[]>(`/projects/${projectId}/tickets`),
  get: (id: number) => request<Ticket>(`/tickets/${id}`),
  create: (projectId: number, data: TicketInput) =>
    request<Ticket>(`/projects/${projectId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: TicketInput) =>
    request<Ticket>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  toggle: (id: number) =>
    request<Ticket>(`/tickets/${id}/toggle`, { method: 'PUT' }),
  remove: (id: number) => request<void>(`/tickets/${id}`, { method: 'DELETE' }),
}
