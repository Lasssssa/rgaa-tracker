import { useState } from 'react'
import { usePages } from '../../hooks/usePages'
import type { Page, PageInput, ProjectError } from '../../types'
import ConfirmModal from '../ui/ConfirmModal'
import Modal from '../ui/Modal'
import EmptyPagesState from './EmptyPagesState'
import PageForm from './PageForm'
import PageList from './PageList'
import './PagesSection.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; page: Page }
  | { mode: 'delete'; page: Page }

interface PagesSectionProps {
  /** Pages state owned by the page (shared with the tab counter). */
  state: ReturnType<typeof usePages>
  /** The project's errors, to show how many each page carries. */
  projectErrors: ProjectError[]
  /** Called after update/delete so the errors list refreshes its
   * page assignments. */
  onPagesChanged: () => void
}

export default function PagesSection({
  state,
  projectErrors,
  onPagesChanged,
}: PagesSectionProps) {
  const { pages, loading, error, setError, createPage, updatePage, removePage } =
    state
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })

  function errorCount(page: Page): number {
    return projectErrors.filter((e) => e.page?.id === page.id).length
  }

  async function handleCreate(data: PageInput) {
    await createPage(data)
    setDialog({ mode: 'closed' })
  }

  async function handleUpdate(id: number, data: PageInput) {
    await updatePage(id, data)
    setDialog({ mode: 'closed' })
    onPagesChanged()
  }

  async function handleDelete(page: Page) {
    try {
      await removePage(page.id)
      onPagesChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    } finally {
      setDialog({ mode: 'closed' })
    }
  }

  return (
    <section className="pages-section">
      <header className="pages-header">
        <p className="pages-hint">
          L'échantillon des pages auditées. Les erreurs sans page sont des
          éléments globaux / transverses.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setDialog({ mode: 'create' })}
        >
          + Nouvelle page
        </button>
      </header>

      {error && <p className="page-error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : pages.length === 0 ? (
        <EmptyPagesState
          onCreateManually={() => setDialog({ mode: 'create' })}
        />
      ) : (
        <PageList
          pages={pages}
          errorCount={errorCount}
          onEdit={(page) => setDialog({ mode: 'edit', page })}
          onDelete={(page) => setDialog({ mode: 'delete', page })}
        />
      )}

      {(dialog.mode === 'create' || dialog.mode === 'edit') && (
        <Modal onClose={() => setDialog({ mode: 'closed' })}>
          <PageForm
            initial={dialog.mode === 'edit' ? dialog.page : null}
            onCancel={() => setDialog({ mode: 'closed' })}
            onSubmit={(data) =>
              dialog.mode === 'edit'
                ? handleUpdate(dialog.page.id, data)
                : handleCreate(data)
            }
          />
        </Modal>
      )}

      {dialog.mode === 'delete' && (
        <ConfirmModal
          title="Supprimer la page"
          message={`La page « ${dialog.page.name} » sera supprimée. Ses erreurs seront conservées et redeviendront des éléments globaux / transverses.`}
          onCancel={() => setDialog({ mode: 'closed' })}
          onConfirm={() => handleDelete(dialog.page)}
        />
      )}
    </section>
  )
}
