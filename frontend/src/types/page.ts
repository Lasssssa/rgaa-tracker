export interface Page {
  id: number
  project_id: number
  name: string
  url: string | null
  created_at: string
  updated_at: string
}

export interface PageInput {
  name: string
  url?: string | null
}
