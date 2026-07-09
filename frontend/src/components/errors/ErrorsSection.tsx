import { useMemo, useState } from 'react'
import { useErrors } from '../../hooks/useErrors'
import { SEVERITIES, severityLabel, severityRank } from '../../lib/severity'
import type { ProjectError, ErrorInput } from '../../types'
import Modal from '../ui/Modal'
import SeverityBadge from '../ui/SeverityBadge'
import StatusBadge from '../ui/StatusBadge'
import ErrorForm from './ErrorForm'
import ErrorList from './ErrorList'
import './ErrorsSection.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; error: ProjectError }
  | { mode: 'view'; error: ProjectError }

type GroupBy = 'thematic' | 'criterion' | 'severity' | 'none'

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'thematic', label: 'Thématique' },
  { value: 'criterion', label: 'Critère' },
  { value: 'severity', label: 'Sévérité' },
  { value: 'none', label: 'Aucun' },
]

interface ErrorGroup {
  key: string
  label: string
  errors: ProjectError[]
}

/** Most severe first, then most recent first. */
function sortErrors(errors: ProjectError[]): ProjectError[] {
  return [...errors].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      b.created_at.localeCompare(a.created_at),
  )
}

function groupErrors(errors: ProjectError[], groupBy: GroupBy): ErrorGroup[] {
  const sorted = sortErrors(errors)

  if (groupBy === 'none') {
    return [{ key: 'all', label: '', errors: sorted }]
  }

  if (groupBy === 'severity') {
    return SEVERITIES.map(({ value }) => ({
      key: value,
      label: severityLabel(value),
      errors: sorted.filter((t) => t.severity === value),
    })).filter((group) => group.errors.length > 0)
  }

  const groups = new Map<string, ErrorGroup & { order: number[] }>()
  for (const error of sorted) {
    const criterion = error.criterion
    let key: string
    let label: string
    let order: number[]
    if (criterion == null) {
      key = 'none'
      label = 'Sans critère'
      order = [Number.MAX_SAFE_INTEGER]
    } else if (groupBy === 'thematic') {
      key = `thematic-${criterion.thematic.number}`
      label = `${criterion.thematic.number}. ${criterion.thematic.name}`
      order = [criterion.thematic.number]
    } else {
      key = `criterion-${criterion.id}`
      label = `${criterion.code} — ${criterion.title}`
      order = criterion.code.split('.').map(Number)
    }
    const group = groups.get(key)
    if (group) {
      group.errors.push(error)
    } else {
      groups.set(key, { key, label, errors: [error], order })
    }
  }

  return [...groups.values()]
    .sort((a, b) => {
      for (let i = 0; i < Math.max(a.order.length, b.order.length); i++) {
        const diff = (a.order[i] ?? 0) - (b.order[i] ?? 0)
        if (diff !== 0) return diff
      }
      return 0
    })
    .map(({ key, label, errors: groupErrors }) => ({
      key,
      label,
      errors: groupErrors,
    }))
}

interface ErrorsSectionProps {
  projectId: number
}

export default function ErrorsSection({ projectId }: ErrorsSectionProps) {
  const {
    errors,
    loading,
    error,
    setError,
    createError,
    updateError,
    toggleError,
    removeError,
  } = useErrors(projectId)
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })
  const [groupBy, setGroupBy] = useState<GroupBy>('thematic')

  const groups = useMemo(() => groupErrors(errors, groupBy), [errors, groupBy])

  async function handleCreate(data: ErrorInput) {
    await createError(data)
    setDialog({ mode: 'closed' })
  }

  async function handleUpdate(id: number, data: ErrorInput) {
    await updateError(id, data)
    setDialog({ mode: 'closed' })
  }

  async function handleToggle(error: ProjectError) {
    try {
      await toggleError(error.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible')
    }
  }

  async function handleDelete(error: ProjectError) {
    if (!window.confirm(`Supprimer l’erreur « ${error.name} » ?`)) return
    try {
      await removeError(error.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    }
  }

  return (
    <section className="errors-section">
      <header className="errors-header">
        <h2>
          Erreurs {!loading && <span className="count">({errors.length})</span>}
        </h2>
        <div className="errors-controls">
          <label className="group-by">
            Grouper par
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            >
              {GROUP_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setDialog({ mode: 'create' })}
          >
            + Nouvelle erreur
          </button>
        </div>
      </header>

      {error && <p className="page-error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : errors.length === 0 ? (
        <p className="empty">Aucune erreur pour ce projet.</p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="error-group">
            {group.label && (
              <h3 className="error-group-title">
                {group.label}
                <span className="error-group-count">
                  {group.errors.length}
                </span>
              </h3>
            )}
            <ErrorList
              errors={group.errors}
              onView={(error) => setDialog({ mode: 'view', error })}
              onToggle={handleToggle}
              onEdit={(error) => setDialog({ mode: 'edit', error })}
              onDelete={handleDelete}
            />
          </div>
        ))
      )}

      {(dialog.mode === 'create' || dialog.mode === 'edit') && (
        <Modal size="lg" onClose={() => setDialog({ mode: 'closed' })}>
          <ErrorForm
            initial={dialog.mode === 'edit' ? dialog.error : null}
            onCancel={() => setDialog({ mode: 'closed' })}
            onSubmit={(data) =>
              dialog.mode === 'edit'
                ? handleUpdate(dialog.error.id, data)
                : handleCreate(data)
            }
          />
        </Modal>
      )}

      {dialog.mode === 'view' && (
        <Modal size="lg" onClose={() => setDialog({ mode: 'closed' })}>
          <div className="error-view">
            <div className="error-view-head">
              <h2>{dialog.error.name}</h2>
              <SeverityBadge severity={dialog.error.severity} />
              <StatusBadge patched={dialog.error.is_patched} />
            </div>
            {dialog.error.criterion && (
              <p className="error-view-criterion">
                <span className="criterion-chip">
                  {dialog.error.criterion.code}
                </span>
                {dialog.error.criterion.title}
              </p>
            )}
            <p className="error-view-desc">
              {dialog.error.description || 'Aucune description.'}
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDialog({ mode: 'closed' })}
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}
