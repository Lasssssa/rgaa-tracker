import type { ProjectError } from './error'

export interface Issue {
  id: number
  project_id: number
  name: string
  description: string | null
  errors: ProjectError[]
  created_at: string
  updated_at: string
}

export interface IssueInput {
  name: string
  description?: string | null
  error_ids: number[]
}
