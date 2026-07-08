import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'sidebar-link active' : 'sidebar-link'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">RGAA Tracker</div>
      <nav className="sidebar-nav">
        <NavLink to="/projects" className={navLinkClass}>
          Projects
        </NavLink>
        <NavLink to="/chat" className={navLinkClass}>
          Chat
        </NavLink>
      </nav>
    </aside>
  )
}
