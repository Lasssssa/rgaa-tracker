export type Severity = 'minor' | 'moderate' | 'major' | 'critical'

export interface TicketCriterion {
  id: number
  code: string
  title: string
  thematic: {
    number: number
    name: string
  }
}

export interface Ticket {
  id: number
  project_id: number
  name: string
  description: string | null
  severity: Severity
  criterion: TicketCriterion | null
  is_patched: boolean
  created_at: string
  updated_at: string
}

export interface TicketInput {
  name: string
  description?: string | null
  criterion_id: number
  severity: Severity
}
