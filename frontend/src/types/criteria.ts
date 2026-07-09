export interface Criterion {
  id: number
  thematic_id: number
  number: number
  code: string
  title: string
  url: string | null
}

export interface Thematic {
  id: number
  number: number
  name: string
  criteria: Criterion[]
}
