import { useState } from 'react'
import { SparklesIcon } from '../ui/icons'

interface EmptyIssuesStateProps {
  onCreateManually: () => void
}

export default function EmptyIssuesState({
  onCreateManually,
}: EmptyIssuesStateProps) {
  const [notice, setNotice] = useState(false)

  return (
    <div className="empty-errors">
      <p className="empty-errors-title">Aucune issue pour ce projet</p>

      <button
        type="button"
        className="upload-dropzone"
        onClick={() => setNotice(true)}
      >
        <span className="upload-icon" aria-hidden="true">
          <SparklesIcon width={26} height={26} />
        </span>
        <span className="upload-title">Générer les issues GitLab</span>
        <span className="upload-hint">
          Regroupe automatiquement les erreurs en issues prêtes à exporter
        </span>
      </button>

      {notice && (
        <p className="form-hint" role="status">
          La génération automatique arrive bientôt — en attendant, créez vos
          issues manuellement.
        </p>
      )}

      <p className="empty-errors-or">
        ou{' '}
        <button type="button" className="btn-link" onClick={onCreateManually}>
          créez une issue manuellement
        </button>
      </p>
    </div>
  )
}
