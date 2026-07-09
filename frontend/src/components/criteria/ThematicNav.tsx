import type { Thematic } from '../../types'

interface ThematicNavProps {
  thematics: Thematic[]
}

export default function ThematicNav({ thematics }: ThematicNavProps) {
  return (
    <nav className="thematic-nav" aria-label="Thématiques">
      {thematics.map((thematic) => (
        <a
          key={thematic.id}
          href={`#thematic-${thematic.number}`}
          className="thematic-nav-pill"
        >
          <span className="thematic-nav-number">{thematic.number}</span>
          {thematic.name}
        </a>
      ))}
    </nav>
  )
}
