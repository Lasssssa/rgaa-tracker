import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi, type Project } from '../api'
import TicketsSection from './TicketsSection'
import './ProjectDetailPage.css'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('fr-FR')
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('fr-FR')
}

function formatRate(value: number | null): string {
  return value == null ? '—' : `${Math.round(value)} %`
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const projectId = Number(id)
    if (!Number.isInteger(projectId)) {
      setError('Identifiant de projet invalide')
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    projectsApi
      .get(projectId)
      .then((data) => {
        if (active) setProject(data)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Chargement impossible')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

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

          <TicketsSection projectId={project.id} />
        </>
      ) : null}
    </main>
  )
}
