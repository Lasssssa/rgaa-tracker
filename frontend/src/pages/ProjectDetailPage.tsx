import { Link, useParams } from 'react-router-dom'
import ErrorsSection from '../components/errors/ErrorsSection'
import { useProject } from '../hooks/useProject'
import { formatDate, formatDateTime, formatRate } from '../lib/format'
import './ProjectDetailPage.css'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { project, loading, error } = useProject(id)

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
            <h1>{project.name}</h1>
            {project.client && <p className="subtitle">{project.client}</p>}
          </header>

          <dl className="detail-grid">
            <div>
              <dt>Client</dt>
              <dd>{project.client ?? '—'}</dd>
            </div>
            <div>
              <dt>Date d'audit</dt>
              <dd>{formatDate(project.audit_date)}</dd>
            </div>
            <div>
              <dt>Taux de conformité global</dt>
              <dd>{formatRate(project.global_compliance_rate)}</dd>
            </div>
            <div>
              <dt>Projet GitLab</dt>
              <dd>{project.gitlab_project_id ?? '—'}</dd>
            </div>
            <div>
              <dt>Créé le</dt>
              <dd>{formatDateTime(project.created_at)}</dd>
            </div>
            <div>
              <dt>Mis à jour le</dt>
              <dd>{formatDateTime(project.updated_at)}</dd>
            </div>
          </dl>

          <ErrorsSection projectId={project.id} />
        </>
      ) : null}
    </main>
  )
}
