import { useState } from 'react'
import ProjectForm from '../components/projects/ProjectForm'
import ProjectsTable from '../components/projects/ProjectsTable'
import Modal from '../components/ui/Modal'
import { useProjects } from '../hooks/useProjects'
import type { Project, ProjectInput } from '../types'
import './ProjectsPage.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; project: Project }

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
    if (!window.confirm(`Supprimer le projet « ${project.name} » ?`)) return
    try {
      await removeProject(project.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
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
          onDelete={handleDelete}
        />
      )}

      {dialog.mode !== 'closed' && (
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
    </main>
  )
}
