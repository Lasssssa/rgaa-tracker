import { useState } from 'react'
import { useTickets } from '../../hooks/useTickets'
import type { Ticket, TicketInput } from '../../types'
import Modal from '../ui/Modal'
import StatusBadge from '../ui/StatusBadge'
import TicketForm from './TicketForm'
import TicketList from './TicketList'
import './TicketsSection.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; ticket: Ticket }
  | { mode: 'view'; ticket: Ticket }

interface TicketsSectionProps {
  projectId: number
}

export default function TicketsSection({ projectId }: TicketsSectionProps) {
  const {
    tickets,
    loading,
    error,
    setError,
    createTicket,
    updateTicket,
    toggleTicket,
    removeTicket,
  } = useTickets(projectId)
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })

  async function handleCreate(data: TicketInput) {
    await createTicket(data)
    setDialog({ mode: 'closed' })
  }

  async function handleUpdate(id: number, data: TicketInput) {
    await updateTicket(id, data)
    setDialog({ mode: 'closed' })
  }

  async function handleToggle(ticket: Ticket) {
    try {
      await toggleTicket(ticket.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible')
    }
  }

  async function handleDelete(ticket: Ticket) {
    if (!window.confirm(`Supprimer le ticket « ${ticket.name} » ?`)) return
    try {
      await removeTicket(ticket.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    }
  }

  return (
    <section className="tickets-section">
      <header className="tickets-header">
        <h2>
          Tickets {!loading && <span className="count">({tickets.length})</span>}
        </h2>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setDialog({ mode: 'create' })}
        >
          + Nouveau ticket
        </button>
      </header>

      {error && <p className="page-error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : tickets.length === 0 ? (
        <p className="empty">Aucun ticket pour ce projet.</p>
      ) : (
        <TicketList
          tickets={tickets}
          onView={(ticket) => setDialog({ mode: 'view', ticket })}
          onToggle={handleToggle}
          onEdit={(ticket) => setDialog({ mode: 'edit', ticket })}
          onDelete={handleDelete}
        />
      )}

      {(dialog.mode === 'create' || dialog.mode === 'edit') && (
        <Modal onClose={() => setDialog({ mode: 'closed' })}>
          <TicketForm
            initial={dialog.mode === 'edit' ? dialog.ticket : null}
            onCancel={() => setDialog({ mode: 'closed' })}
            onSubmit={(data) =>
              dialog.mode === 'edit'
                ? handleUpdate(dialog.ticket.id, data)
                : handleCreate(data)
            }
          />
        </Modal>
      )}

      {dialog.mode === 'view' && (
        <Modal onClose={() => setDialog({ mode: 'closed' })}>
          <div className="ticket-view">
            <div className="ticket-view-head">
              <h2>{dialog.ticket.name}</h2>
              <StatusBadge patched={dialog.ticket.is_patched} />
            </div>
            <p className="ticket-view-desc">
              {dialog.ticket.description || 'Aucune description.'}
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDialog({ mode: 'closed' })}
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}
