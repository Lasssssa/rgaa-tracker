import { useMemo, useState } from 'react'
import { useErrors } from '../../hooks/useErrors'
import { SEVERITIES, severityLabel, severityRank } from '../../lib/severity'
import type { ProjectError, ErrorInput } from '../../types'
import ConfirmModal from '../ui/ConfirmModal'
import Modal from '../ui/Modal'
import SeverityBadge from '../ui/SeverityBadge'
import StatusBadge from '../ui/StatusBadge'
import EmptyErrorsState from './EmptyErrorsState'
import ErrorForm from './ErrorForm'
import ErrorList from './ErrorList'
import './ErrorsSection.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; error: ProjectError }
  | { mode: 'view'; error: ProjectError }
  | { mode: 'delete'; error: ProjectError }

type GroupBy = 'thematic' | 'criterion' | 'severity' | 'none'

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'thematic', label: 'Thématique' },
  { value: 'criterion', label: 'Critère' },
  { value: 'severity', label: 'Sévérité' },
  { value: 'none', label: 'Liste' },
]

const GROUP_BY_STORAGE_KEY = 'errors-group-by'

function initialGroupBy(): GroupBy {
  const saved = localStorage.getItem(GROUP_BY_STORAGE_KEY)
  return GROUP_OPTIONS.some((o) => o.value === saved)
    ? (saved as GroupBy)
    : 'thematic'
}

interface ErrorGroup {
  key: string
  label: string
  /** Full criterion title, revealed on demand (too long for the header). */
  description?: string
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
    let description: string | undefined
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
      label = `Critère ${criterion.code}`
      description = criterion.title
      order = criterion.code.split('.').map(Number)
    }
    const group = groups.get(key)
    if (group) {
      group.errors.push(error)
    } else {
      groups.set(key, { key, label, description, errors: [error], order })
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
    .map(({ key, label, description, errors: groupErrors }) => ({
      key,
      label,
      description,
      errors: groupErrors,
    }))
}

interface GroupHeaderProps {
  label: string
  description?: string
  count: number
}

function GroupHeader({ label, description, count }: GroupHeaderProps) {
  const [showDescription, setShowDescription] = useState(false)

  return (
    <div className="error-group-head">
      <h3 className="error-group-title">
        {label}
        <span className="error-group-count">{count}</span>
        {description && (
          <button
            type="button"
            className="group-info-toggle"
            onClick={() => setShowDescription((value) => !value)}
            aria-expanded={showDescription}
            aria-label={
              showDescription
                ? 'Masquer l’intitulé du critère'
                : 'Afficher l’intitulé du critère'
            }
            title={showDescription ? undefined : description}
          >
            i
          </button>
        )}
      </h3>
      {description && showDescription && (
        <p className="error-group-desc">{description}</p>
      )}
    </div>
  )
}

interface ErrorsSectionProps {
  projectId: number
  /** Errors state owned by the page, so it can derive stats from it. */
  state: ReturnType<typeof useErrors>
}

export default function ErrorsSection({ projectId, state }: ErrorsSectionProps) {
  const {
    errors,
    loading,
    error,
    setError,
    createError,
    updateError,
    toggleError,
    removeError,
  } = state
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })
  const [groupBy, setGroupBy] = useState<GroupBy>(initialGroupBy)

  const groups = useMemo(() => groupErrors(errors, groupBy), [errors, groupBy])

  function changeGroupBy(value: GroupBy) {
    setGroupBy(value)
    localStorage.setItem(GROUP_BY_STORAGE_KEY, value)
  }

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
    try {
      await removeError(error.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    } finally {
      setDialog({ mode: 'closed' })
    }
  }

  return (
    <section className="errors-section">
      <header className="errors-header">
        <div className="errors-controls">
          <fieldset className="segmented">
            <legend className="sr-only">Grouper les erreurs par</legend>
            {GROUP_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className={groupBy === value ? 'segment active' : 'segment'}
              >
                <input
                  type="radio"
                  name="errors-group-by"
                  value={value}
                  checked={groupBy === value}
                  onChange={() => changeGroupBy(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
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
        <EmptyErrorsState
          projectId={projectId}
          onCreateManually={() => setDialog({ mode: 'create' })}
        />
      ) : (
        groups.map((group) => (
          <div key={group.key} className="error-group">
            {group.label && (
              <GroupHeader
                label={group.label}
                description={group.description}
                count={group.errors.length}
              />
            )}
            <ErrorList
              errors={group.errors}
              onView={(error) => setDialog({ mode: 'view', error })}
              onToggle={handleToggle}
              onEdit={(error) => setDialog({ mode: 'edit', error })}
              onDelete={(error) => setDialog({ mode: 'delete', error })}
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

      {dialog.mode === 'delete' && (
        <ConfirmModal
          title="Supprimer l’erreur"
          message={`L’erreur « ${dialog.error.name} » sera définitivement supprimée.`}
          onCancel={() => setDialog({ mode: 'closed' })}
          onConfirm={() => handleDelete(dialog.error)}
        />
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
