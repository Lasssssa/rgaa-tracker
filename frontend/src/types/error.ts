export type Severity = 'minor' | 'moderate' | 'major' | 'critical'

export interface ErrorCriterion {
  id: number
  code: string
  title: string
  thematic: {
    number: number
    name: string
  }
}

export interface ErrorPage {
  id: number
  name: string
  url: string | null
}

export interface ProjectError {
  id: number
  project_id: number
  name: string
  description: string | null
  severity: Severity
  criterion: ErrorCriterion | null
  issue_id: number | null
  /** The audited page, or null for a global / transverse element. */
  page: ErrorPage | null
  is_patched: boolean
  created_at: string
  updated_at: string
}

export interface ErrorInput {
  name: string
  description?: string | null
  criterion_id: number
  severity: Severity
  page_id?: number | null
}
