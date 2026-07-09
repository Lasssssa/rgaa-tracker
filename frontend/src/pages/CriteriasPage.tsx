import { useThematics } from '../hooks/useThematics'
import './CriteriasPage.css'

export default function CriteriasPage() {
  const { thematics, loading, error } = useThematics()

  const totalCriteria = thematics.reduce(
    (sum, thematic) => sum + thematic.criteria.length,
    0,
  )

  return (
    <main className="criterias-page">
      <header className="criterias-header">
        <h1>Critères RGAA</h1>
        <p className="subtitle">
          {loading
            ? 'Suivi des critères du référentiel'
            : `${thematics.length} thématiques · ${totalCriteria} critères`}
        </p>
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
        thematics.map((thematic) => (
          <section key={thematic.id} className="thematic-section">
            <h2>
              <span className="thematic-number">{thematic.number}</span>
              {thematic.name}
              <span className="thematic-count">
                {thematic.criteria.length} critères
              </span>
            </h2>
            <ul className="criteria-list">
              {thematic.criteria.map((criterion) => (
                <li key={criterion.id} className="criterion-row">
                  <span className="criterion-code">{criterion.code}</span>
                  <span className="criterion-title">{criterion.title}</span>
                  {criterion.url && (
                    <a
                      href={criterion.url}
                      target="_blank"
                      rel="noreferrer"
                      className="criterion-doc"
                      aria-label={`Documentation du critère ${criterion.code}`}
                    >
                      Doc ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  )
}
