import { Link } from 'react-router-dom'
import { formatDate, formatRate } from '../../lib/format'
import type { Project } from '../../types'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className="project-card-heading">
        <h2 className="project-card-title">
          {/* The link stretches over the whole card (see CSS) so a click
              anywhere navigates, while its accessible name stays the title. */}
          <Link to={`/projects/${project.id}`}>{project.name}</Link>
        </h2>
        <p className="project-card-client">
          {project.client ?? 'Client non renseigné'}
        </p>
      </div>

      <dl className="project-card-stats">
        <div className="stat stat-accent">
          <dt>Erreurs</dt>
          <dd>{project.error_count}</dd>
        </div>
        <div className="stat">
          <dt>Conformité</dt>
          <dd>{formatRate(project.global_compliance_rate)}</dd>
        </div>
        <div className="stat">
          <dt>Date d'audit</dt>
          <dd>{formatDate(project.audit_date)}</dd>
        </div>
        <div className="stat">
          <dt>GitLab</dt>
          <dd>{project.gitlab_project_id ?? '—'}</dd>
        </div>
      </dl>

      <div className="project-card-actions">
        <button
          type="button"
          className="btn-link"
          onClick={() => onEdit(project)}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn-link danger"
          onClick={() => onDelete(project)}
        >
          Supprimer
        </button>
      </div>
    </article>
  )
}
