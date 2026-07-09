import { useEffect, useRef, useState } from 'react'

/**
 * Track which of the given sections is currently being read.
 *
 * Observes a narrow band near the top of the viewport; the first section
 * (in document order) crossing that band is the active one.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const intersecting = useRef(new Map<string, boolean>())

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId(null)
      return
    }

    intersecting.current = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersecting.current.set(entry.target.id, entry.isIntersecting)
        }
        const active = ids.find((id) => intersecting.current.get(id))
        setActiveId(active ?? null)
      },
      // A band covering the top quarter of the viewport.
      { rootMargin: '0px 0px -75% 0px' },
    )

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [ids.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  return activeId
}
