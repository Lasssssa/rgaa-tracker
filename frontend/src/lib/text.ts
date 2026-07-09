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
