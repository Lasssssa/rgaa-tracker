import type { Issue, IssueInput } from '../types'
import { request } from './client'

export const issuesApi = {
  list: (projectId: number) =>
    request<Issue[]>(`/projects/${projectId}/issues`),
  create: (projectId: number, data: IssueInput) =>
    request<Issue>(`/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<IssueInput>) =>
    request<Issue>(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: number) => request<void>(`/issues/${id}`, { method: 'DELETE' }),
}
