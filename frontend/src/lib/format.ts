export function formatDate(value: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('fr-FR')
}

export function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('fr-FR')
}

export function formatRate(value: number | null): string {
  return value == null ? '—' : `${Math.round(value)} %`
}
