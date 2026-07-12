import type { ProjectError } from '../../types'
import SeverityBadge from '../ui/SeverityBadge'
import StatusBadge from '../ui/StatusBadge'

interface ErrorListProps {
  errors: ProjectError[]
  onView: (error: ProjectError) => void
  onToggle: (error: ProjectError) => void
  onEdit: (error: ProjectError) => void
  onDelete: (error: ProjectError) => void
}

export default function ErrorList({
  errors,
  onView,
  onToggle,
  onEdit,
  onDelete,
}: ErrorListProps) {
  return (
    <ul className="errors-list">
      {errors.map((error) => (
        <li key={error.id} className="error-row">
          <div className="error-main">
            {error.criterion && (
              <span
                className="criterion-chip"
                title={error.criterion.title}
              >
                {error.criterion.code}
              </span>
            )}
            <button
              type="button"
              className="error-name"
              onClick={() => onView(error)}
            >
              {error.name}
            </button>
            {error.page && (
              <span className="error-page-tag" title={error.page.url ?? undefined}>
                {error.page.name}
              </span>
            )}
            <SeverityBadge severity={error.severity} />
            <StatusBadge patched={error.is_patched} />
          </div>
          <div className="error-actions">
            <button
              type="button"
              className="btn-link"
              onClick={() => onToggle(error)}
            >
              {error.is_patched ? 'Marquer à corriger' : 'Marquer corrigé'}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => onEdit(error)}
            >
              Modifier
            </button>
            <button
              type="button"
              className="btn-link danger"
              onClick={() => onDelete(error)}
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
