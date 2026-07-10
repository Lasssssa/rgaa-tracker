import { useState } from 'react'
import ProjectForm from '../../components/projects/ProjectForm'
import ProjectsTable from '../../components/projects/ProjectsTable'
import ConfirmModal from '../../components/ui/ConfirmModal'
import Modal from '../../components/ui/Modal'
import { useProjects } from '../../hooks/useProjects'
import type { Project, ProjectInput } from '../../types'
import './ProjectsPage.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; project: Project }
  | { mode: 'delete'; project: Project }

export default function ProjectsPage() {
  const {
    projects,
    loading,
    error,
    setError,
    createProject,
    updateProject,
    removeProject,
  } = useProjects()
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })

  async function handleCreate(data: ProjectInput) {
    await createProject(data)
    setDialog({ mode: 'closed' })
  }

  async function handleUpdate(id: number, data: ProjectInput) {
    await updateProject(id, data)
    setDialog({ mode: 'closed' })
  }

  async function handleDelete(project: Project) {
    try {
      await removeProject(project.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    } finally {
      setDialog({ mode: 'closed' })
    }
  }

  return (
    <main className="projects-page">
      <header className="projects-header">
        <div>
          <h1>Projets</h1>
          <p className="subtitle">Suivi des audits RGAA</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setDialog({ mode: 'create' })}
        >
          + Nouveau projet
        </button>
      </header>

      {error && <p className="page-error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : projects.length === 0 ? (
        <p className="empty">
          Aucun projet pour l'instant. Créez-en un pour démarrer.
        </p>
      ) : (
        <ProjectsTable
          projects={projects}
          onEdit={(project) => setDialog({ mode: 'edit', project })}
          onDelete={(project) => setDialog({ mode: 'delete', project })}
        />
      )}

      {(dialog.mode === 'create' || dialog.mode === 'edit') && (
        <Modal onClose={() => setDialog({ mode: 'closed' })}>
          <ProjectForm
            initial={dialog.mode === 'edit' ? dialog.project : null}
            onCancel={() => setDialog({ mode: 'closed' })}
            onSubmit={(data) =>
              dialog.mode === 'edit'
                ? handleUpdate(dialog.project.id, data)
                : handleCreate(data)
            }
          />
        </Modal>
      )}

      {dialog.mode === 'delete' && (
        <ConfirmModal
          title="Supprimer le projet"
          message={`Le projet « ${dialog.project.name} » et ses ${dialog.project.error_count} erreur${dialog.project.error_count > 1 ? 's' : ''} seront définitivement supprimés.`}
          onCancel={() => setDialog({ mode: 'closed' })}
          onConfirm={() => handleDelete(dialog.project)}
        />
      )}
    </main>
  )
}
