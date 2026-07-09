export interface MethodologyTest {
  test: string
  content: string
}

export interface Criterion {
  id: number
  thematic_id: number
  number: number
  code: string
  title: string
  url: string | null
  methodology: MethodologyTest[] | null
}

export interface Thematic {
  id: number
  number: number
  name: string
  criteria: Criterion[]
}

/** Lightweight criterion returned by GET /criteria (no methodology). */
export interface CriterionListItem {
  id: number
  code: string
  title: string
  thematic: {
    number: number
    name: string
  }
}
