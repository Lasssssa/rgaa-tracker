import type { Severity } from './error'

export type ImportJobStatus = 'pending' | 'running' | 'succeeded' | 'failed'

export interface PreviewPage {
  label: string | null
  name: string
  url: string | null
}

export interface PreviewError {
  name: string
  description: string | null
  criterion_code: string | null
  /** Resolved against the RGAA referential; null when the code was unknown. */
  criterion_id: number | null
  severity: Severity
  /** Single page label this error attaches to, or null for transverse. */
  page_label: string | null
  section_title: string | null
  /** Normalization warnings, e.g. "unknown_criterion", "multiple_pages". */
  flags: string[]
}

export interface ExtractionPreview {
  pages: PreviewPage[]
  errors: PreviewError[]
}

export interface ImportJob {
  id: number
  project_id: number
  status: ImportJobStatus
  error_detail: string | null
  result: ExtractionPreview | null
  created_at: string
  updated_at: string
}

export interface ConfirmResult {
  pages_created: number
  errors_created: number
}
