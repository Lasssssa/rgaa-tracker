import { useEffect, useState } from 'react'
import type { Ticket, TicketInput } from '../api'

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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? '')
    setDescription(initial?.description ?? '')
  }, [initial])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
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
        Description
        <textarea
          value={description}
          rows={4}
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
