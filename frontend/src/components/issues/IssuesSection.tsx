import { useState } from 'react'
import { useIssues } from '../../hooks/useIssues'
import type { Issue, IssueInput, ProjectError } from '../../types'
import ConfirmModal from '../ui/ConfirmModal'
import Modal from '../ui/Modal'
import EmptyIssuesState from './EmptyIssuesState'
import IssueForm from './IssueForm'
import IssueList from './IssueList'
import './IssuesSection.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; issue: Issue }
  | { mode: 'delete'; issue: Issue }

interface IssuesSectionProps {
  /** Issues state owned by the page (shared with the tab counter). */
  state: ReturnType<typeof useIssues>
  /** The project's errors, used to compose issues. */
  projectErrors: ProjectError[]
  /** Called after create/update/delete so the errors list refreshes its
   * issue assignments. */
  onIssuesChanged: () => void
}

export default function IssuesSection({
  state,
  projectErrors,
  onIssuesChanged,
}: IssuesSectionProps) {
  const { issues, loading, error, setError, createIssue, updateIssue, removeIssue } =
    state
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })

  async function handleCreate(data: IssueInput) {
    await createIssue(data)
    setDialog({ mode: 'closed' })
    onIssuesChanged()
  }

  async function handleUpdate(id: number, data: IssueInput) {
    await updateIssue(id, data)
    setDialog({ mode: 'closed' })
    onIssuesChanged()
  }

  async function handleDelete(issue: Issue) {
    try {
      await removeIssue(issue.id)
      onIssuesChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    } finally {
      setDialog({ mode: 'closed' })
    }
  }

  return (
    <section className="issues-section">
      <header className="issues-header">
        <p className="issues-hint">
          Regroupez des erreurs en issues, prêtes à exporter vers GitLab.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setDialog({ mode: 'create' })}
        >
          + Nouvelle issue
        </button>
      </header>

      {error && <p className="page-error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : issues.length === 0 ? (
        <EmptyIssuesState
          onCreateManually={() => setDialog({ mode: 'create' })}
        />
      ) : (
        <IssueList
          issues={issues}
          onEdit={(issue) => setDialog({ mode: 'edit', issue })}
          onDelete={(issue) => setDialog({ mode: 'delete', issue })}
        />
      )}

      {(dialog.mode === 'create' || dialog.mode === 'edit') && (
        <Modal size="lg" onClose={() => setDialog({ mode: 'closed' })}>
          <IssueForm
            initial={dialog.mode === 'edit' ? dialog.issue : null}
            projectErrors={projectErrors}
            onCancel={() => setDialog({ mode: 'closed' })}
            onSubmit={(data) =>
              dialog.mode === 'edit'
                ? handleUpdate(dialog.issue.id, data)
                : handleCreate(data)
            }
          />
        </Modal>
      )}

      {dialog.mode === 'delete' && (
        <ConfirmModal
          title="Supprimer l’issue"
          message={`L’issue « ${dialog.issue.name} » sera supprimée. Les erreurs regroupées seront conservées.`}
          onCancel={() => setDialog({ mode: 'closed' })}
          onConfirm={() => handleDelete(dialog.issue)}
        />
      )}
    </section>
  )
}
