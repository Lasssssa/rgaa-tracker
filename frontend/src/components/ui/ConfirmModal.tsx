import { useState } from 'react'
import Modal from './Modal'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

/** Confirmation dialog for destructive actions. */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Supprimer',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [busy, setBusy] = useState(false)

  async function handleConfirm() {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onCancel}>
      <div className="confirm-modal" role="alertdialog" aria-label={title}>
        <h2>{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? 'Suppression…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
