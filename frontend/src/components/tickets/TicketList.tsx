import type { Ticket } from '../../types'
import SeverityBadge from '../ui/SeverityBadge'
import StatusBadge from '../ui/StatusBadge'

interface TicketListProps {
  tickets: Ticket[]
  onView: (ticket: Ticket) => void
  onToggle: (ticket: Ticket) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
}

export default function TicketList({
  tickets,
  onView,
  onToggle,
  onEdit,
  onDelete,
}: TicketListProps) {
  return (
    <ul className="tickets-list">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="ticket-row">
          <div className="ticket-main">
            {ticket.criterion && (
              <span
                className="criterion-chip"
                title={ticket.criterion.title}
              >
                {ticket.criterion.code}
              </span>
            )}
            <button
              type="button"
              className="ticket-name"
              onClick={() => onView(ticket)}
            >
              {ticket.name}
            </button>
            <SeverityBadge severity={ticket.severity} />
            <StatusBadge patched={ticket.is_patched} />
          </div>
          <div className="ticket-actions">
            <button
              type="button"
              className="btn-link"
              onClick={() => onToggle(ticket)}
            >
              {ticket.is_patched ? 'Marquer à corriger' : 'Marquer corrigé'}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => onEdit(ticket)}
            >
              Modifier
            </button>
            <button
              type="button"
              className="btn-link danger"
              onClick={() => onDelete(ticket)}
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
