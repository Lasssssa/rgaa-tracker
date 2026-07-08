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
