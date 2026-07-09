import { useMemo, useState } from 'react'
import CriterionRow from '../components/criteria/CriterionRow'
import ThematicToc from '../components/criteria/ThematicToc'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { useThematics } from '../hooks/useThematics'
import { matchesWords } from '../lib/text'
import './CriteriasPage.css'

export default function CriteriasPage() {
  const { thematics, loading, error } = useThematics()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return thematics
    return thematics
      .map((thematic) => ({
        ...thematic,
        criteria: thematic.criteria.filter((criterion) =>
          matchesWords(
            `${criterion.code} ${criterion.title} ${thematic.name}`,
            q,
          ),
        ),
      }))
      .filter((thematic) => thematic.criteria.length > 0)
  }, [thematics, query])

  const sectionIds = useMemo(
    () => filtered.map((thematic) => `thematic-${thematic.number}`),
    [filtered],
  )
  const activeId = useScrollSpy(sectionIds)

  const totalCriteria = thematics.reduce((sum, t) => sum + t.criteria.length, 0)
  const matchCount = filtered.reduce((sum, t) => sum + t.criteria.length, 0)
  const isFiltering = query.trim().length > 0

  return (
    <main className="criterias-page">
      <header className="criterias-header">
        <div>
          <h1>Critères RGAA</h1>
          <p className="subtitle">
            {loading
              ? 'Référentiel officiel'
              : `${thematics.length} thématiques · ${totalCriteria} critères`}
          </p>
        </div>
        <div className="criterias-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un critère… (ex : contraste, 3.2)"
            aria-label="Rechercher un critère"
          />
          {isFiltering && (
            <p className="search-count" role="status">
              {matchCount} critère{matchCount > 1 ? 's' : ''} trouvé
              {matchCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </header>

      {error && <p className="page-error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : thematics.length === 0 ? (
        <p className="empty">
          Référentiel vide. Lancez la commande d'import :{' '}
          <code>python -m app.commands.import_criteria</code>
        </p>
      ) : (
        <div className="criterias-layout">
          <ThematicToc thematics={filtered} activeId={activeId} />

          <div className="criterias-content">
            {filtered.length === 0 ? (
              <p className="empty">Aucun critère ne correspond à « {query} ».</p>
            ) : (
              filtered.map((thematic) => (
                <section
                  key={thematic.id}
                  id={`thematic-${thematic.number}`}
                  className="thematic-section"
                >
                  <h2>
                    <span className="thematic-number">{thematic.number}</span>
                    {thematic.name}
                    <span className="thematic-count">
                      {thematic.criteria.length} critère
                      {thematic.criteria.length > 1 ? 's' : ''}
                    </span>
                  </h2>
                  <ul className="criteria-list">
                    {thematic.criteria.map((criterion) => (
                      <CriterionRow key={criterion.id} criterion={criterion} />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  )
}
