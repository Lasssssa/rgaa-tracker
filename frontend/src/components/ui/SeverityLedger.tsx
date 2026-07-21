import { SEVERITIES, severityLabel } from '../../lib/severity'
import type { ProjectError } from '../../types'

interface SeverityLedgerProps {
  errors: ProjectError[]
}

/**
 * The signature element: a segmented meter of the project's error load by
 * severity — the distribution auditors actually triage by. The bar is purely
 * visual (aria-hidden); the legend carries the real, screen-reader-accessible
 * counts, and a hidden summary states the whole distribution in one sentence.
 */
export default function SeverityLedger({ errors }: SeverityLedgerProps) {
  const total = errors.length
  const counts = SEVERITIES.map(({ value }) => ({
    value,
    label: severityLabel(value),
    count: errors.filter((e) => e.severity === value).length,
  }))

  const summary = counts
    .filter((c) => c.count > 0)
    .map((c) => `${c.count} ${c.label.toLowerCase()}`)
    .join(', ')

  return (
    <figure className="severity-ledger">
      <figcaption className="eyebrow">Répartition par sévérité</figcaption>

      <div className="severity-bar" aria-hidden="true">
        {total === 0 ? (
          <span className="severity-seg severity-empty" />
        ) : (
          counts
            .filter((c) => c.count > 0)
            .map((c) => (
              <span
                key={c.value}
                className={`severity-seg sev-${c.value}`}
                style={{ flexGrow: c.count }}
              />
            ))
        )}
      </div>

      <ul className="severity-legend">
        {counts.map((c) => (
          <li key={c.value} className="severity-legend-item">
            <span className={`severity-dot sev-${c.value}`} aria-hidden="true" />
            <span className="severity-legend-label">{c.label}</span>
            <span className="num severity-legend-count">{c.count}</span>
          </li>
        ))}
      </ul>

      <span className="sr-only">
        {total} erreur{total > 1 ? 's' : ''}
        {summary ? ` : ${summary}.` : '.'}
      </span>
    </figure>
  )
}
