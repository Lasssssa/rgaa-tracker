import type { CriterionListItem, Thematic } from '../types'
import { request } from './client'

export const criteriaApi = {
  listThematics: () => request<Thematic[]>('/thematics'),
  listCriteria: () => request<CriterionListItem[]>('/criteria'),
}
