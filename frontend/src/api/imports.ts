import type { ConfirmResult, ExtractionPreview, ImportJob } from '../types'
import { request } from './client'

export const importsApi = {
  /** Start background extraction from the project's uploaded audit PDF. */
  start: (projectId: number) =>
    request<ImportJob>(`/projects/${projectId}/audit-pdf/extract`, {
      method: 'POST',
    }),
  get: (jobId: number) => request<ImportJob>(`/imports/${jobId}`),
  confirm: (jobId: number, preview: ExtractionPreview) =>
    request<ConfirmResult>(`/imports/${jobId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(preview),
    }),
}
