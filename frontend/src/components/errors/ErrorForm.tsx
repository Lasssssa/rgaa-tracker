import { useEffect, useState } from 'react'
import { useCriteriaList } from '../../hooks/useCriteriaList'
import { SEVERITIES } from '../../lib/severity'
import type { Page, Severity, ProjectError, ErrorInput } from '../../types'
import CriterionPicker from './CriterionPicker'

interface ErrorFormProps {
  initial?: ProjectError | null
  /** The project's audited pages; empty means everything is transverse. */
  pages: Page[]
  onCancel: () => void
  onSubmit: (data: ErrorInput) => Promise<void>
}

export default function ErrorForm({
  initial,
  pages,
  onCancel,
  onSubmit,
}: ErrorFormProps) {
  const { criteria, loading: criteriaLoading } = useCriteriaList()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [criterionId, setCriterionId] = useState<number | null>(null)
  const [severity, setSeverity] = useState<Severity>('moderate')
  const [pageId, setPageId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? '')
    setDescription(initial?.description ?? '')
    setCriterionId(initial?.criterion?.id ?? null)
    setSeverity(initial?.severity ?? 'moderate')
    setPageId(initial?.page?.id ?? null)
  }, [initial])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (criterionId == null) {
      setError('Sélectionnez le critère RGAA concerné.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        criterion_id: criterionId,
        severity,
        page_id: pageId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Modifier l’erreur' : 'Nouvelle erreur'}</h2>

      <div className="form-row">
        <label>
          Nom <span aria-hidden="true">*</span>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            placeholder="Contraste insuffisant"
          />
        </label>

        <label>
          Sévérité <span aria-hidden="true">*</span>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            {SEVERITIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-field">
        <span className="form-label">
          Critère RGAA <span aria-hidden="true">*</span>
        </span>
        {criteriaLoading ? (
          <p className="form-hint">Chargement des critères…</p>
        ) : (
          <CriterionPicker
            criteria={criteria}
            value={criterionId}
            onChange={setCriterionId}
          />
        )}
      </div>

      <label>
        Page concernée
        <select
          value={pageId ?? ''}
          onChange={(e) =>
            setPageId(e.target.value === '' ? null : Number(e.target.value))
          }
        >
          <option value="">Élément global / transverse</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
      </label>
      {pages.length === 0 && (
        <p className="form-hint">
          Ce projet n'a pas encore de pages — ajoutez-en depuis l'onglet
          « Pages » pour rattacher l'erreur à une page précise.
        </p>
      )}

      <label>
        Description
        <textarea
          value={description}
          rows={6}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Détail du problème et de la correction attendue"
        />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Enregistrement…' : initial ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </form>
  )
}
