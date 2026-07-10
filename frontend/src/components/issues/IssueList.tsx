import type { Issue } from '../../types'

interface IssueListProps {
  issues: Issue[]
  onEdit: (issue: Issue) => void
  onDelete: (issue: Issue) => void
}

export default function IssueList({ issues, onEdit, onDelete }: IssueListProps) {
  return (
    <ul className="issues-list">
      {issues.map((issue) => (
        <li key={issue.id} className="issue-card">
          <div className="issue-card-head">
            <h3 className="issue-name">{issue.name}</h3>
            <div className="issue-actions">
              <button
                type="button"
                className="btn-link"
                onClick={() => onEdit(issue)}
              >
                Modifier
              </button>
              <button
                type="button"
                className="btn-link danger"
                onClick={() => onDelete(issue)}
              >
                Supprimer
              </button>
            </div>
          </div>

          {issue.description && (
            <p className="issue-description">{issue.description}</p>
          )}

          {issue.errors.length === 0 ? (
            <p className="issue-empty-errors">Aucune erreur associée</p>
          ) : (
            <ul className="issue-errors">
              {issue.errors.map((error) => (
                <li key={error.id} className="issue-error-pill">
                  {error.criterion && (
                    <span className="issue-error-code">
                      {error.criterion.code}
                    </span>
                  )}
                  {error.name}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
