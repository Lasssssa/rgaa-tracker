import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi, type Project, type ProjectInput } from '../api'
import ProjectForm from './ProjectForm'
import './ProjectsPage.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; project: Project }

function formatDate(value: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('fr-FR')
}

function formatRate(value: number | null): string {
  return value == null ? '—' : `${Math.round(value)} %`
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setProjects(await projectsApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(data: ProjectInput) {
    const created = await projectsApi.create(data)
    setProjects((prev) => [created, ...prev])
    setDialog({ mode: 'closed' })
  }

  async function handleUpdate(id: number, data: ProjectInput) {
    const updated = await projectsApi.update(id, data)
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setDialog({ mode: 'closed' })
  }

  async function handleDelete(project: Project) {
    if (!window.confirm(`Supprimer le projet « ${project.name} » ?`)) return
    try {
      await projectsApi.remove(project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
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
        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Client</th>
                <th>Date d'audit</th>
                <th>Conformité</th>
                <th>Tickets</th>
                <th>GitLab</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td data-label="Nom">
                    <Link to={`/projects/${project.id}`} className="project-link">
                      {project.name}
                    </Link>
                  </td>
                  <td data-label="Client">{project.client ?? '—'}</td>
                  <td data-label="Date d'audit">{formatDate(project.audit_date)}</td>
                  <td data-label="Conformité">
                    {formatRate(project.global_compliance_rate)}
                  </td>
                  <td data-label="Tickets">{project.ticket_count}</td>
                  <td data-label="GitLab">{project.gitlab_project_id ?? '—'}</td>
                  <td data-label="Actions" className="actions-col">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => setDialog({ mode: 'edit', project })}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-link danger"
                      onClick={() => handleDelete(project)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialog.mode !== 'closed' && (
        <div
          className="modal-overlay"
          onClick={() => setDialog({ mode: 'closed' })}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <ProjectForm
              initial={dialog.mode === 'edit' ? dialog.project : null}
              onCancel={() => setDialog({ mode: 'closed' })}
              onSubmit={(data) =>
                dialog.mode === 'edit'
                  ? handleUpdate(dialog.project.id, data)
                  : handleCreate(data)
              }
            />
          </div>
        </div>
      )}
    </main>
  )
}
