/** Lowercase and strip accents, for accent-insensitive matching. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Does `haystack` contain `needle`, ignoring case and accents? */
export function fuzzyIncludes(haystack: string, needle: string): boolean {
  return normalize(haystack).includes(normalize(needle))
}

/** Does `haystack` contain every whitespace-separated word of `query`
 * (in any order), ignoring case and accents? */
export function matchesWords(haystack: string, query: string): boolean {
  const normalized = normalize(haystack)
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => normalized.includes(normalize(word)))
}
