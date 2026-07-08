export interface Ticket {
  id: number
  project_id: number
  name: string
  description: string | null
  is_patched: boolean
  created_at: string
  updated_at: string
}

export interface TicketInput {
  name: string
  description?: string | null
}
