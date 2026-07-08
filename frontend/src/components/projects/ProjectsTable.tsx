import { Link } from 'react-router-dom'
import type { Project } from '../../types'
import { formatDate, formatRate } from '../../lib/format'

interface ProjectsTableProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export default function ProjectsTable({
  projects,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  return (
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
