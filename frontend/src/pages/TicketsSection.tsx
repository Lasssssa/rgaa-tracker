import { useEffect, useState } from 'react'
import { ticketsApi, type Ticket, type TicketInput } from '../api'
import TicketForm from './TicketForm'
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
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setTickets(await ticketsApi.list(projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleCreate(data: TicketInput) {
    const created = await ticketsApi.create(projectId, data)
    setTickets((prev) => [created, ...prev])
    setDialog({ mode: 'closed' })
  }

  async function handleUpdate(id: number, data: TicketInput) {
    const updated = await ticketsApi.update(id, data)
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)))
    setDialog({ mode: 'closed' })
  }

  async function handleToggle(ticket: Ticket) {
    try {
      const updated = await ticketsApi.toggle(ticket.id)
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? updated : t)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible')
    }
  }

  async function handleDelete(ticket: Ticket) {
    if (!window.confirm(`Supprimer le ticket « ${ticket.name} » ?`)) return
    try {
      await ticketsApi.remove(ticket.id)
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    }
  }

  return (
    <section className="tickets-section">
      <header className="tickets-header">
        <h2>Tickets {!loading && <span className="count">({tickets.length})</span>}</h2>
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
        <ul className="tickets-list">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="ticket-row">
              <div className="ticket-main">
                <button
                  type="button"
                  className="ticket-name"
                  onClick={() => setDialog({ mode: 'view', ticket })}
                >
                  {ticket.name}
                </button>
                <span
                  className={`badge ${ticket.is_patched ? 'patched' : 'todo'}`}
                >
                  {ticket.is_patched ? 'Corrigé' : 'À corriger'}
                </span>
              </div>
              <div className="ticket-actions">
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => handleToggle(ticket)}
                >
                  {ticket.is_patched ? 'Marquer à corriger' : 'Marquer corrigé'}
                </button>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setDialog({ mode: 'edit', ticket })}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn-link danger"
                  onClick={() => handleDelete(ticket)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(dialog.mode === 'create' || dialog.mode === 'edit') && (
        <div className="modal-overlay" onClick={() => setDialog({ mode: 'closed' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <TicketForm
              initial={dialog.mode === 'edit' ? dialog.ticket : null}
              onCancel={() => setDialog({ mode: 'closed' })}
              onSubmit={(data) =>
                dialog.mode === 'edit'
                  ? handleUpdate(dialog.ticket.id, data)
                  : handleCreate(data)
              }
            />
          </div>
        </div>
      )}

      {dialog.mode === 'view' && (
        <div className="modal-overlay" onClick={() => setDialog({ mode: 'closed' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-view">
              <div className="ticket-view-head">
                <h2>{dialog.ticket.name}</h2>
                <span
                  className={`badge ${dialog.ticket.is_patched ? 'patched' : 'todo'}`}
                >
                  {dialog.ticket.is_patched ? 'Corrigé' : 'À corriger'}
                </span>
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
          </div>
        </div>
      )}
    </section>
  )
}
