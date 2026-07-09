import { useEffect, useState } from 'react'
import { useCriteriaList } from '../../hooks/useCriteriaList'
import { SEVERITIES } from '../../lib/severity'
import type { Severity, Ticket, TicketInput } from '../../types'
import CriterionPicker from './CriterionPicker'

interface TicketFormProps {
  initial?: Ticket | null
  onCancel: () => void
  onSubmit: (data: TicketInput) => Promise<void>
}

export default function TicketForm({
  initial,
  onCancel,
  onSubmit,
}: TicketFormProps) {
  const { criteria, loading: criteriaLoading } = useCriteriaList()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [criterionId, setCriterionId] = useState<number | null>(null)
  const [severity, setSeverity] = useState<Severity>('moderate')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? '')
    setDescription(initial?.description ?? '')
    setCriterionId(initial?.criterion?.id ?? null)
    setSeverity(initial?.severity ?? 'moderate')
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
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Modifier le ticket' : 'Nouveau ticket'}</h2>

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
