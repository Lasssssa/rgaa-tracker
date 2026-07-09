import CriterionRow from '../components/criteria/CriterionRow'
import ThematicNav from '../components/criteria/ThematicNav'
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
        <>
          <ThematicNav thematics={thematics} />

          {thematics.map((thematic) => (
            <section
              key={thematic.id}
              id={`thematic-${thematic.number}`}
              className="thematic-section"
            >
              <h2>
                <span className="thematic-number">{thematic.number}</span>
                {thematic.name}
                <span className="thematic-count">
                  {thematic.criteria.length} critères
                </span>
              </h2>
              <ul className="criteria-list">
                {thematic.criteria.map((criterion) => (
                  <CriterionRow key={criterion.id} criterion={criterion} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </main>
  )
}
