import { useRef, useState } from 'react'
import { projectsApi } from '../../api'
import { useImport } from '../../hooks/useImport'
import ImportReviewModal from '../imports/ImportReviewModal'
import '../imports/ImportReviewModal.css'
import { UploadIcon } from '../ui/icons'

type UploadStatus =
  | { state: 'idle' }
  | { state: 'uploading' }
  | { state: 'done'; filename: string }
  | { state: 'failed'; message: string }

const MAX_PDF_SIZE = 100 * 1024 * 1024 // keep in sync with the API limit

interface EmptyErrorsStateProps {
  projectId: number
  onCreateManually: () => void
  /** Called after imported errors/pages have been persisted, so the parent
   * can refresh both lists. */
  onImported: () => void
}

export default function EmptyErrorsState({
  projectId,
  onCreateManually,
  onImported,
}: EmptyErrorsStateProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<UploadStatus>({ state: 'idle' })
  const imp = useImport()

  async function handleFile(file: File | undefined) {
    if (!file) return
    // Reset right away so selecting the same file again re-triggers change.
    if (inputRef.current) inputRef.current.value = ''
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus({
        state: 'failed',
        message: 'Seuls les fichiers PDF sont acceptés.',
      })
      return
    }
    if (file.size > MAX_PDF_SIZE) {
      setStatus({
        state: 'failed',
        message: 'Le fichier dépasse la taille maximale de 100 Mo.',
      })
      return
    }
    setStatus({ state: 'uploading' })
    try {
      const result = await projectsApi.uploadAuditPdf(projectId, file)
      setStatus({ state: 'done', filename: result.filename })
    } catch (err) {
      setStatus({
        state: 'failed',
        message: err instanceof Error ? err.message : 'Import impossible',
      })
    }
  }

  async function handleConfirm(edited: Parameters<typeof imp.confirm>[0]) {
    await imp.confirm(edited)
    onImported()
  }

  const extracting =
    imp.phase.status === 'starting' || imp.phase.status === 'running'

  if (status.state === 'done') {
    return (
      <div className="empty-errors">
        <div className="upload-done" role="status">
          <p className="upload-done-title">
            Rapport « {status.filename} » importé
          </p>
          {imp.phase.status === 'failed' ? (
            <p className="page-error" role="alert">
              {imp.phase.message}
            </p>
          ) : (
            <p className="upload-done-hint">
              Lancez l'extraction automatique des erreurs, ou saisissez-les
              manuellement.
            </p>
          )}
          <div className="upload-done-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => imp.start(projectId)}
              disabled={extracting}
            >
              {extracting ? 'Extraction en cours…' : 'Extraire les erreurs'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onCreateManually}
            >
              Saisir manuellement
            </button>
          </div>
          {extracting && (
            <p className="upload-done-hint">
              L'analyse du PDF peut prendre jusqu'à une minute.
            </p>
          )}
        </div>

        {(imp.phase.status === 'ready' || imp.phase.status === 'confirming') && (
          <ImportReviewModal
            preview={imp.phase.preview}
            confirming={imp.phase.status === 'confirming'}
            onConfirm={handleConfirm}
            onClose={imp.reset}
          />
        )}
      </div>
    )
  }

  return (
    <div className="empty-errors">
      <p className="empty-errors-title">Aucune erreur pour ce projet</p>

      <button
        type="button"
        className="upload-dropzone"
        onClick={() => inputRef.current?.click()}
        disabled={status.state === 'uploading'}
      >
        <span className="upload-icon" aria-hidden="true">
          <UploadIcon width={26} height={26} />
        </span>
        <span className="upload-title">
          {status.state === 'uploading'
            ? 'Import en cours…'
            : "Importer le rapport d'audit (PDF)"}
        </span>
        <span className="upload-hint">
          Les erreurs seront extraites automatiquement du rapport
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        aria-label="Importer le rapport d'audit au format PDF"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {status.state === 'failed' && (
        <p className="page-error" role="alert">{status.message}</p>
      )}

      <p className="empty-errors-or">
        ou{' '}
        <button type="button" className="btn-link" onClick={onCreateManually}>
          saisissez une première erreur manuellement
        </button>
      </p>
    </div>
  )
}
