import { useMemo, useState } from 'react'
import { useTickets } from '../../hooks/useTickets'
import { SEVERITIES, severityLabel, severityRank } from '../../lib/severity'
import type { Ticket, TicketInput } from '../../types'
import Modal from '../ui/Modal'
import SeverityBadge from '../ui/SeverityBadge'
import StatusBadge from '../ui/StatusBadge'
import TicketForm from './TicketForm'
import TicketList from './TicketList'
import './TicketsSection.css'

type Dialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; ticket: Ticket }
  | { mode: 'view'; ticket: Ticket }

type GroupBy = 'thematic' | 'criterion' | 'severity' | 'none'

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'thematic', label: 'Thématique' },
  { value: 'criterion', label: 'Critère' },
  { value: 'severity', label: 'Sévérité' },
  { value: 'none', label: 'Aucun' },
]

interface TicketGroup {
  key: string
  label: string
  tickets: Ticket[]
}

/** Most severe first, then most recent first. */
function sortTickets(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      b.created_at.localeCompare(a.created_at),
  )
}

function groupTickets(tickets: Ticket[], groupBy: GroupBy): TicketGroup[] {
  const sorted = sortTickets(tickets)

  if (groupBy === 'none') {
    return [{ key: 'all', label: '', tickets: sorted }]
  }

  if (groupBy === 'severity') {
    return SEVERITIES.map(({ value }) => ({
      key: value,
      label: severityLabel(value),
      tickets: sorted.filter((t) => t.severity === value),
    })).filter((group) => group.tickets.length > 0)
  }

  const groups = new Map<string, TicketGroup & { order: number[] }>()
  for (const ticket of sorted) {
    const criterion = ticket.criterion
    let key: string
    let label: string
    let order: number[]
    if (criterion == null) {
      key = 'none'
      label = 'Sans critère'
      order = [Number.MAX_SAFE_INTEGER]
    } else if (groupBy === 'thematic') {
      key = `thematic-${criterion.thematic.number}`
      label = `${criterion.thematic.number}. ${criterion.thematic.name}`
      order = [criterion.thematic.number]
    } else {
      key = `criterion-${criterion.id}`
      label = `${criterion.code} — ${criterion.title}`
      order = criterion.code.split('.').map(Number)
    }
    const group = groups.get(key)
    if (group) {
      group.tickets.push(ticket)
    } else {
      groups.set(key, { key, label, tickets: [ticket], order })
    }
  }

  return [...groups.values()]
    .sort((a, b) => {
      for (let i = 0; i < Math.max(a.order.length, b.order.length); i++) {
        const diff = (a.order[i] ?? 0) - (b.order[i] ?? 0)
        if (diff !== 0) return diff
      }
      return 0
    })
    .map(({ key, label, tickets: groupTickets }) => ({
      key,
      label,
      tickets: groupTickets,
    }))
}

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
  const [groupBy, setGroupBy] = useState<GroupBy>('thematic')

  const groups = useMemo(() => groupTickets(tickets, groupBy), [tickets, groupBy])

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
        <div className="tickets-controls">
          <label className="group-by">
            Grouper par
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            >
              {GROUP_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setDialog({ mode: 'create' })}
          >
            + Nouveau ticket
          </button>
        </div>
      </header>

      {error && <p className="page-error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : tickets.length === 0 ? (
        <p className="empty">Aucun ticket pour ce projet.</p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="ticket-group">
            {group.label && (
              <h3 className="ticket-group-title">
                {group.label}
                <span className="ticket-group-count">
                  {group.tickets.length}
                </span>
              </h3>
            )}
            <TicketList
              tickets={group.tickets}
              onView={(ticket) => setDialog({ mode: 'view', ticket })}
              onToggle={handleToggle}
              onEdit={(ticket) => setDialog({ mode: 'edit', ticket })}
              onDelete={handleDelete}
            />
          </div>
        ))
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
              <SeverityBadge severity={dialog.ticket.severity} />
              <StatusBadge patched={dialog.ticket.is_patched} />
            </div>
            {dialog.ticket.criterion && (
              <p className="ticket-view-criterion">
                <span className="criterion-chip">
                  {dialog.ticket.criterion.code}
                </span>
                {dialog.ticket.criterion.title}
              </p>
            )}
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
