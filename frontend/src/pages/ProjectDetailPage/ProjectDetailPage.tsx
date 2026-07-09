import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi } from '../../api'
import ErrorsSection from '../../components/errors/ErrorsSection'
import ProjectForm from '../../components/projects/ProjectForm'
import Modal from '../../components/ui/Modal'
import { useErrors } from '../../hooks/useErrors'
import { useProject } from '../../hooks/useProject'
import { formatDate, formatDateTime, formatRate } from '../../lib/format'
import type { ProjectInput } from '../../types'
import './ProjectDetailPage.css'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { project, setProject, loading, error } = useProject(id)
  const errorsState = useErrors(Number(id))
  const [editing, setEditing] = useState(false)

  const total = errorsState.errors.length
  const patched = errorsState.errors.filter((e) => e.is_patched).length
  const progress = total === 0 ? 0 : Math.round((patched / total) * 100)

  async function handleUpdate(data: ProjectInput) {
    if (!project) return
    const updated = await projectsApi.update(project.id, data)
    setProject(updated)
    setEditing(false)
  }

  return (
    <main className="project-detail">
      <Link to="/projects" className="back-link">
        ← Retour aux projets
      </Link>

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : error ? (
        <p className="page-error" role="alert">{error}</p>
      ) : project ? (
        <>
          <header className="detail-header">
            <div>
              <h1>{project.name}</h1>
              <p className="detail-meta">
                {project.client && <span>{project.client}</span>}
                <span className="detail-dates">
                  Créé le {formatDateTime(project.created_at)} · Mis à jour le{' '}
                  {formatDateTime(project.updated_at)}
                </span>
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(true)}
            >
              Modifier le projet
            </button>
          </header>

          <div className="detail-cards">
            <section className="detail-card info-card" aria-label="Informations">
              <dl>
                <div>
                  <dt>Client</dt>
                  <dd>{project.client ?? '—'}</dd>
                </div>
                <div>
                  <dt>Date d'audit</dt>
                  <dd>{formatDate(project.audit_date)}</dd>
                </div>
                <div>
                  <dt>Projet GitLab</dt>
                  <dd>{project.gitlab_project_id ?? '—'}</dd>
                </div>
                <div>
                  <dt>Conformité globale</dt>
                  <dd>{formatRate(project.global_compliance_rate)}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card progress-card" aria-label="Avancement">
              <h2 className="progress-title">Correction des erreurs</h2>
              {total === 0 ? (
                <p className="progress-empty">Aucune erreur relevée</p>
              ) : (
                <>
                  <p className="progress-figure">
                    {patched}
                    <span className="progress-total"> / {total} corrigée{patched > 1 ? 's' : ''}</span>
                  </p>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Erreurs corrigées"
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="progress-percent">{progress} %</p>
                </>
              )}
            </section>
          </div>

          <ErrorsSection state={errorsState} />

          {editing && (
            <Modal onClose={() => setEditing(false)}>
              <ProjectForm
                initial={project}
                onCancel={() => setEditing(false)}
                onSubmit={handleUpdate}
              />
            </Modal>
          )}
        </>
      ) : null}
    </main>
  )
}
