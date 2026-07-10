import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi } from '../../api'
import ErrorsSection from '../../components/errors/ErrorsSection'
import IssuesSection from '../../components/issues/IssuesSection'
import ProjectForm from '../../components/projects/ProjectForm'
import Modal from '../../components/ui/Modal'
import { useErrors } from '../../hooks/useErrors'
import { useIssues } from '../../hooks/useIssues'
import { useProject } from '../../hooks/useProject'
import { formatDate, formatDateTime, formatRate } from '../../lib/format'
import type { ProjectInput } from '../../types'
import './ProjectDetailPage.css'

type Tab = 'errors' | 'issues'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { project, setProject, loading, error } = useProject(id)
  const errorsState = useErrors(Number(id))
  const issuesState = useIssues(Number(id))
  const [tab, setTab] = useState<Tab>('errors')
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

          <div className="detail-tabs" role="tablist" aria-label="Contenu du projet">
            <button
              type="button"
              role="tab"
              id="tab-errors"
              aria-selected={tab === 'errors'}
              aria-controls="panel-errors"
              className={tab === 'errors' ? 'detail-tab active' : 'detail-tab'}
              onClick={() => setTab('errors')}
            >
              Erreurs
              <span className="tab-count">{errorsState.errors.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-issues"
              aria-selected={tab === 'issues'}
              aria-controls="panel-issues"
              className={tab === 'issues' ? 'detail-tab active' : 'detail-tab'}
              onClick={() => setTab('issues')}
            >
              Issues
              <span className="tab-count">{issuesState.issues.length}</span>
            </button>
          </div>

          {tab === 'errors' ? (
            <div id="panel-errors" role="tabpanel" aria-labelledby="tab-errors">
              <ErrorsSection projectId={project.id} state={errorsState} />
            </div>
          ) : (
            <div id="panel-issues" role="tabpanel" aria-labelledby="tab-issues">
              <IssuesSection
                state={issuesState}
                projectErrors={errorsState.errors}
                onIssuesChanged={errorsState.reload}
              />
            </div>
          )}

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
