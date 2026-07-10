import type { Project, ProjectInput } from '../types'
import { request, upload } from './client'

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
  uploadAuditPdf: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return upload<{ filename: string; size: number }>(
      `/projects/${id}/audit-pdf`,
      form,
    )
  },
}
