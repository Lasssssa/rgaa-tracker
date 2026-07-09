import type { ProjectError, ErrorInput } from '../types'
import { request } from './client'

export const errorsApi = {
  list: (projectId: number) =>
    request<ProjectError[]>(`/projects/${projectId}/errors`),
  get: (id: number) => request<ProjectError>(`/errors/${id}`),
  create: (projectId: number, data: ErrorInput) =>
    request<ProjectError>(`/projects/${projectId}/errors`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ErrorInput) =>
    request<ProjectError>(`/errors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  toggle: (id: number) =>
    request<ProjectError>(`/errors/${id}/toggle`, { method: 'PUT' }),
  remove: (id: number) => request<void>(`/errors/${id}`, { method: 'DELETE' }),
}
