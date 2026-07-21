import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FolderIcon,
  ListChecksIcon,
  MessageCircleIcon,
} from '../ui/icons'

const STORAGE_KEY = 'sidebar-collapsed'

const NAV_ITEMS = [
  { to: '/projects', label: 'Projets', Icon: FolderIcon },
  { to: '/criterias', label: 'Critères', Icon: ListChecksIcon },
  { to: '/chat', label: 'Chat', Icon: MessageCircleIcon },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'sidebar-link active' : 'sidebar-link'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">
          R
        </span>
        <span className="sidebar-text">RGAA Tracker</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={navLinkClass}
            title={collapsed ? label : undefined}
          >
            <Icon className="sidebar-icon" />
            <span className="sidebar-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Étendre la navigation' : 'Réduire la navigation'}
        title={collapsed ? 'Étendre' : undefined}
      >
        {collapsed ? (
          <ChevronsRightIcon className="sidebar-icon" />
        ) : (
          <ChevronsLeftIcon className="sidebar-icon" />
        )}
        <span className="sidebar-text">Réduire</span>
      </button>
    </aside>
  )
}
