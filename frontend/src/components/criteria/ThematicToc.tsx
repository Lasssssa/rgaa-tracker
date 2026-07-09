import type { Thematic } from '../../types'

interface ThematicTocProps {
  thematics: Thematic[]
  activeId: string | null
}

export default function ThematicToc({ thematics, activeId }: ThematicTocProps) {
  return (
    <nav className="thematic-toc" aria-label="Thématiques">
      <p className="thematic-toc-title">Thématiques</p>
      <ul>
        {thematics.map((thematic) => {
          const sectionId = `thematic-${thematic.number}`
          const isActive = activeId === sectionId
          return (
            <li key={thematic.id}>
              <a
                href={`#${sectionId}`}
                className={isActive ? 'toc-link active' : 'toc-link'}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="toc-number">{thematic.number}</span>
                <span className="toc-name">{thematic.name}</span>
                <span className="toc-count">{thematic.criteria.length}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
