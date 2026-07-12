import { useEffect, useMemo, useState } from 'react'
import { severityLabel } from '../../lib/severity'
import { matchesWords } from '../../lib/text'
import type { Issue, IssueInput, ProjectError } from '../../types'
import SeverityBadge from '../ui/SeverityBadge'

/** Everything an error can be searched by in the picker. */
function errorHaystack(error: ProjectError): string {
  const criterion = error.criterion
  return [
    error.name,
    criterion?.code,
    criterion?.title,
    criterion?.thematic.name,
    error.page?.name,
    severityLabel(error.severity),
  ]
    .filter(Boolean)
    .join(' ')
}

interface IssueFormProps {
  initial?: Issue | null
  /** All the project's errors, to compose the issue from. */
  projectErrors: ProjectError[]
  onCancel: () => void
  onSubmit: (data: IssueInput) => Promise<void>
}

export default function IssueForm({
  initial,
  projectErrors,
  onCancel,
  onSubmit,
}: IssueFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [query, setQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visibleErrors = useMemo(() => {
    const q = query.trim()
    if (!q) return projectErrors
    return projectErrors.filter((e) => matchesWords(errorHaystack(e), q))
  }, [projectErrors, query])

  useEffect(() => {
    setName(initial?.name ?? '')
    setDescription(initial?.description ?? '')
    setSelectedIds(new Set(initial?.errors.map((e) => e.id) ?? []))
  }, [initial])

  function toggleErrorSelection(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        error_ids: [...selectedIds],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Modifier l’issue' : 'Nouvelle issue'}</h2>

      <label>
        Nom <span aria-hidden="true">*</span>
        <input
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          placeholder="Corriger les contrastes du site"
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          rows={4}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contexte et plan de correction (repris dans l’issue GitLab)"
        />
      </label>

      <fieldset className="error-picker">
        <legend className="form-label">
          Erreurs regroupées
          <span className="error-picker-count">
            {selectedIds.size} sélectionnée{selectedIds.size > 1 ? 's' : ''}
          </span>
        </legend>
        {projectErrors.length === 0 ? (
          <p className="form-hint">Ce projet n'a pas encore d'erreurs.</p>
        ) : (
          <>
            <input
              type="search"
              className="error-picker-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer… (nom, critère, thématique, sévérité)"
              aria-label="Filtrer les erreurs"
            />
            {visibleErrors.length === 0 ? (
              <p className="form-hint">
                Aucune erreur ne correspond à « {query} ».
              </p>
            ) : (
              <ul className="error-picker-list">
                {visibleErrors.map((projectError) => {
              const inOtherIssue =
                projectError.issue_id != null &&
                projectError.issue_id !== initial?.id
              return (
                <li key={projectError.id}>
                  <label className="error-picker-row">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(projectError.id)}
                      onChange={() => toggleErrorSelection(projectError.id)}
                    />
                    {projectError.criterion && (
                      <span className="criterion-chip">
                        {projectError.criterion.code}
                      </span>
                    )}
                    <span className="error-picker-name">
                      {projectError.name}
                    </span>
                    {inOtherIssue && (
                      <span
                        className="error-picker-taken"
                        title="Déjà associée à une autre issue — la cocher la déplacera ici"
                      >
                        autre issue
                      </span>
                    )}
                    <SeverityBadge severity={projectError.severity} />
                  </label>
                </li>
              )
                })}
              </ul>
            )}
          </>
        )}
      </fieldset>

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
