import type { Page, PageInput } from '../types'
import { request } from './client'

export const pagesApi = {
  list: (projectId: number) => request<Page[]>(`/projects/${projectId}/pages`),
  create: (projectId: number, data: PageInput) =>
    request<Page>(`/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<PageInput>) =>
    request<Page>(`/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: number) => request<void>(`/pages/${id}`, { method: 'DELETE' }),
}
