import { useMemo, useState } from 'react'
import { SEVERITIES } from '../../lib/severity'
import type { ExtractionPreview, PreviewError, Severity } from '../../types'
import Modal from '../ui/Modal'

/** Human-readable labels for the normalization flags coming from the API. */
const FLAG_LABELS: Record<string, string> = {
  unknown_criterion: 'Critère introuvable',
  missing_criterion: 'Sans critère',
  unknown_severity: 'Sévérité devinée',
  multiple_pages: 'Plusieurs pages → transverse',
}

interface Row extends PreviewError {
  included: boolean
}

interface ImportReviewModalProps {
  preview: ExtractionPreview
  confirming: boolean
  onConfirm: (edited: ExtractionPreview) => Promise<void>
  onClose: () => void
}

const NO_SECTION = 'Sans section'

export default function ImportReviewModal({
  preview,
  confirming,
  onConfirm,
  onClose,
}: ImportReviewModalProps) {
  const [rows, setRows] = useState<Row[]>(() =>
    preview.errors.map((e) => ({ ...e, included: true })),
  )
  const [error, setError] = useState<string | null>(null)

  const includedCount = rows.filter((r) => r.included).length

  // Group by section for display, preserving the report's order.
  const groups = useMemo(() => {
    const map = new Map<string, { index: number; row: Row }[]>()
    rows.forEach((row, index) => {
      const key = row.section_title || NO_SECTION
      const list = map.get(key)
      if (list) list.push({ index, row })
      else map.set(key, [{ index, row }])
    })
    return [...map.entries()]
  }, [rows])

  function toggle(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, included: !r.included } : r)),
    )
  }

  function setSeverity(index: number, severity: Severity) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, severity } : r)),
    )
  }

  async function handleConfirm() {
    setError(null)
    const edited: ExtractionPreview = {
      pages: preview.pages,
      errors: rows
        .filter((r) => r.included)
        .map(({ included: _included, ...rest }) => rest),
    }
    try {
      await onConfirm(edited)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import impossible')
    }
  }

  return (
    <Modal size="lg" onClose={onClose}>
      <div className="import-review">
        <header className="import-review-head">
          <h2>Erreurs extraites du rapport</h2>
          <p className="import-review-summary">
            {preview.errors.length} erreur
            {preview.errors.length > 1 ? 's' : ''} détectée
            {preview.errors.length > 1 ? 's' : ''} · {preview.pages.length} page
            {preview.pages.length > 1 ? 's' : ''} de l'échantillon
          </p>
          <p className="import-review-hint">
            Décochez les erreurs à ignorer et ajustez la sévérité si besoin. Les
            pages manquantes seront créées à la validation. Les critères
            introuvables pourront être corrigés ensuite.
          </p>
        </header>

        {error && (
          <p className="page-error" role="alert">
            {error}
          </p>
        )}

        <div className="import-review-body">
          {groups.map(([section, items]) => (
            <div key={section} className="import-group">
              <h3 className="import-group-title">{section}</h3>
              <ul className="import-error-list">
                {items.map(({ index, row }) => (
                  <li
                    key={index}
                    className={
                      row.included
                        ? 'import-error-row'
                        : 'import-error-row excluded'
                    }
                  >
                    <label className="import-error-check">
                      <input
                        type="checkbox"
                        checked={row.included}
                        onChange={() => toggle(index)}
                        aria-label={`Inclure « ${row.name} »`}
                      />
                    </label>
                    <div className="import-error-main">
                      <p className="import-error-name">{row.name}</p>
                      {row.description && (
                        <p className="import-error-desc">{row.description}</p>
                      )}
                      <div className="import-error-meta">
                        {row.criterion_code ? (
                          <span
                            className={
                              row.criterion_id
                                ? 'criterion-chip'
                                : 'criterion-chip unresolved'
                            }
                          >
                            {row.criterion_code}
                          </span>
                        ) : null}
                        <span className="import-error-page">
                          {row.page_label ?? 'Transverse'}
                        </span>
                        {row.flags.map((flag) => (
                          <span key={flag} className="import-flag">
                            {FLAG_LABELS[flag] ?? flag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <label className="import-error-severity">
                      <span className="sr-only">Sévérité</span>
                      <select
                        value={row.severity}
                        onChange={(e) =>
                          setSeverity(index, e.target.value as Severity)
                        }
                        disabled={!row.included}
                      >
                        {SEVERITIES.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
            disabled={confirming || includedCount === 0}
          >
            {confirming
              ? 'Import en cours…'
              : `Importer ${includedCount} erreur${includedCount > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </Modal>
  )
}
