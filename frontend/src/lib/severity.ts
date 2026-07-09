import type { Severity } from '../types'

/** Ordered from most to least severe — used for select options and sorting. */
export const SEVERITIES: { value: Severity; label: string }[] = [
  { value: 'critical', label: 'Critique' },
  { value: 'major', label: 'Majeure' },
  { value: 'moderate', label: 'Modérée' },
  { value: 'minor', label: 'Mineure' },
]

const LABELS = new Map(SEVERITIES.map((s) => [s.value, s.label]))
const RANKS = new Map(SEVERITIES.map((s, index) => [s.value, index]))

export function severityLabel(severity: Severity): string {
  return LABELS.get(severity) ?? severity
}

/** Lower rank = more severe. */
export function severityRank(severity: Severity): number {
  return RANKS.get(severity) ?? SEVERITIES.length
}
