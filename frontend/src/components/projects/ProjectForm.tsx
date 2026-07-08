import { useEffect, useState } from 'react'
import type { Project, ProjectInput } from '../../types'

interface ProjectFormProps {
  initial?: Project | null
  onCancel: () => void
  onSubmit: (data: ProjectInput) => Promise<void>
}

export default function ProjectForm({
  initial,
  onCancel,
  onSubmit,
}: ProjectFormProps) {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [auditDate, setAuditDate] = useState('')
  const [gitlabProjectId, setGitlabProjectId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? '')
    setClient(initial?.client ?? '')
    setAuditDate(initial?.audit_date ?? '')
    setGitlabProjectId(initial?.gitlab_project_id ?? '')
  }, [initial])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        client: client.trim() || null,
        audit_date: auditDate || null,
        gitlab_project_id: gitlabProjectId.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Modifier le projet' : 'Nouveau projet'}</h2>

      <label>
        Nom <span aria-hidden="true">*</span>
        <input
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          placeholder="Site institutionnel"
        />
      </label>

      <label>
        Client
        <input
          type="text"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Ministère X"
        />
      </label>

      <label>
        Date d'audit
        <input
          type="date"
          value={auditDate}
          onChange={(e) => setAuditDate(e.target.value)}
        />
      </label>

      <label>
        ID projet GitLab
        <input
          type="text"
          value={gitlabProjectId}
          onChange={(e) => setGitlabProjectId(e.target.value)}
          placeholder="Optionnel"
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
