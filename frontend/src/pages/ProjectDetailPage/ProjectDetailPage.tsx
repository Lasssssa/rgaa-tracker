import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi } from '../../api'
import ErrorsSection from '../../components/errors/ErrorsSection'
import IssuesSection from '../../components/issues/IssuesSection'
import PagesSection from '../../components/pages/PagesSection'
import ProjectForm from '../../components/projects/ProjectForm'
import Modal from '../../components/ui/Modal'
import SeverityLedger from '../../components/ui/SeverityLedger'
import { useErrors } from '../../hooks/useErrors'
import { useIssues } from '../../hooks/useIssues'
import { usePages } from '../../hooks/usePages'
import { useProject } from '../../hooks/useProject'
import { formatDate, formatDateTime, formatRate } from '../../lib/format'
import type { ProjectInput } from '../../types'
import './ProjectDetailPage.css'

type Tab = 'errors' | 'pages' | 'issues'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { project, setProject, loading, error } = useProject(id)
  const errorsState = useErrors(Number(id))
  const pagesState = usePages(Number(id))
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

          <section className="audit-summary" aria-label="Synthèse de l'audit">
            <div className="audit-thesis">
              <p className="eyebrow">Correction des erreurs</p>
              {total === 0 ? (
                <p className="audit-thesis-empty">
                  Aucune erreur relevée pour l'instant.
                </p>
              ) : (
                <>
                  <p className="audit-figure">
                    <span className="num audit-figure-value">{progress}</span>
                    <span className="audit-figure-unit">%</span>
                  </p>
                  <p className="audit-figure-sub">
                    <span className="num">{patched}</span> / {total} erreur
                    {total > 1 ? 's' : ''} corrigée{patched !== 1 ? 's' : ''}
                  </p>
                  <div
                    className="audit-progress"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Taux de correction"
                  >
                    <div
                      className="audit-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            {total > 0 && (
              <div className="audit-ledger">
                <SeverityLedger errors={errorsState.errors} />
              </div>
            )}

            <dl className="audit-meta">
              <div>
                <dt className="eyebrow">Client</dt>
                <dd>{project.client ?? '—'}</dd>
              </div>
              <div>
                <dt className="eyebrow">Date d'audit</dt>
                <dd className="num">{formatDate(project.audit_date)}</dd>
              </div>
              <div>
                <dt className="eyebrow">Conformité</dt>
                <dd className="num">
                  {formatRate(project.global_compliance_rate)}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">GitLab</dt>
                <dd className="num">{project.gitlab_project_id ?? '—'}</dd>
              </div>
            </dl>
          </section>

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
              id="tab-pages"
              aria-selected={tab === 'pages'}
              aria-controls="panel-pages"
              className={tab === 'pages' ? 'detail-tab active' : 'detail-tab'}
              onClick={() => setTab('pages')}
            >
              Pages
              <span className="tab-count">{pagesState.pages.length}</span>
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
              <ErrorsSection
                projectId={project.id}
                state={errorsState}
                pages={pagesState.pages}
                onImported={() => {
                  errorsState.reload()
                  pagesState.reload()
                }}
              />
            </div>
          ) : tab === 'pages' ? (
            <div id="panel-pages" role="tabpanel" aria-labelledby="tab-pages">
              <PagesSection
                state={pagesState}
                projectErrors={errorsState.errors}
                onPagesChanged={errorsState.reload}
              />
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
