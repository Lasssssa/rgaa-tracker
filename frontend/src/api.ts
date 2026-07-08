const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8001'

export interface Project {
  id: number
  name: string
  client: string | null
  audit_date: string | null
  gitlab_project_id: string | null
  global_compliance_rate: number | null
  ticket_count: number
  created_at: string
  updated_at: string
}

export interface ProjectInput {
  name: string
  client?: string | null
  audit_date?: string | null
  gitlab_project_id?: string | null
}

export interface Ticket {
  id: number
  project_id: number
  name: string
  description: string | null
  is_patched: boolean
  created_at: string
  updated_at: string
}

export interface TicketInput {
  name: string
  description?: string | null
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${detail}`)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export const projectsApi = {
  list: () => request<Project[]>('/projects'),
  get: (id: number) => request<Project>(`/projects/${id}`),
  create: (data: ProjectInput) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProjectInput) =>
    request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
}

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
