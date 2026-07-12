import { useState } from 'react'
import { SparklesIcon } from '../ui/icons'

interface EmptyPagesStateProps {
  onCreateManually: () => void
}

export default function EmptyPagesState({
  onCreateManually,
}: EmptyPagesStateProps) {
  const [notice, setNotice] = useState(false)

  return (
    <div className="empty-errors">
      <p className="empty-errors-title">Aucune page pour ce projet</p>

      <button
        type="button"
        className="upload-dropzone"
        onClick={() => setNotice(true)}
      >
        <span className="upload-icon" aria-hidden="true">
          <SparklesIcon width={26} height={26} />
        </span>
        <span className="upload-title">Extraire l'échantillon de pages</span>
        <span className="upload-hint">
          Récupère automatiquement les pages auditées depuis le rapport d'audit
        </span>
      </button>

      {notice && (
        <p className="form-hint" role="status">
          L'extraction automatique arrive bientôt — en attendant, créez vos
          pages manuellement.
        </p>
      )}

      <p className="empty-errors-or">
        ou{' '}
        <button type="button" className="btn-link" onClick={onCreateManually}>
          créez une première page manuellement
        </button>
      </p>
    </div>
  )
}
