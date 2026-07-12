import type { Page } from '../../types'

interface PageListProps {
  pages: Page[]
  errorCount: (page: Page) => number
  onEdit: (page: Page) => void
  onDelete: (page: Page) => void
}

export default function PageList({
  pages,
  errorCount,
  onEdit,
  onDelete,
}: PageListProps) {
  return (
    <ul className="pages-list">
      {pages.map((page) => {
        const count = errorCount(page)
        return (
          <li key={page.id} className="page-row">
            <div className="page-main">
              <span className="page-name">{page.name}</span>
              {page.url && (
                <a
                  className="page-url"
                  href={page.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {page.url}
                </a>
              )}
              <span className="page-count">
                {count === 0
                  ? 'Aucune erreur'
                  : `${count} erreur${count > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="page-actions">
              <button
                type="button"
                className="btn-link"
                onClick={() => onEdit(page)}
              >
                Modifier
              </button>
              <button
                type="button"
                className="btn-link danger"
                onClick={() => onDelete(page)}
              >
                Supprimer
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
