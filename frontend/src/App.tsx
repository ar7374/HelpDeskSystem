import { FormEvent, useMemo, useState } from 'react'
import './App.css'

type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed'

type Ticket = {
  id: string
  ticketNumber: string
  title: string
  priority: TicketPriority
  status: TicketStatus
  customerName: string
  agentName?: string
  createdAtUtc: string
  slaDueAtUtc: string
}

const tenantId = '2f39f1f7-8895-4ad2-95f7-8f70e5f02571'
const customerId = '52a437d8-7304-4f60-aae4-2136b51ea69d'

const initialTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'HD-1001',
    title: 'Login OTP not received',
    priority: 'High',
    status: 'Open',
    customerName: 'Priya Customer',
    agentName: 'Rahul Agent',
    createdAtUtc: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    slaDueAtUtc: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    ticketNumber: 'HD-1002',
    title: 'Billing invoice mismatch',
    priority: 'Medium',
    status: 'InProgress',
    customerName: 'Arjun Customer',
    agentName: 'Rahul Agent',
    createdAtUtc: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    slaDueAtUtc: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    ticketNumber: 'HD-1003',
    title: 'Export report failed',
    priority: 'Urgent',
    status: 'Resolved',
    customerName: 'Priya Customer',
    agentName: 'Rahul Agent',
    createdAtUtc: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    slaDueAtUtc: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    ticketNumber: 'HD-1004',
    title: 'Password reset page slow',
    priority: 'Low',
    status: 'Closed',
    customerName: 'Arjun Customer',
    createdAtUtc: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    slaDueAtUtc: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
]

function App() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'All' | TicketStatus>('All')
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as TicketPriority,
  })

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'All' || ticket.status === status

      return matchesSearch && matchesStatus
    })
  }, [search, status, tickets])

  const summary = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === 'Open').length
    const inProgress = tickets.filter((ticket) => ticket.status === 'InProgress').length
    const resolved = tickets.filter((ticket) => ticket.status === 'Resolved' || ticket.status === 'Closed').length
    const breached = tickets.filter((ticket) => new Date(ticket.slaDueAtUtc) < new Date() && ticket.status !== 'Closed').length

    return { open, inProgress, resolved, breached }
  }, [tickets])

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const optimisticTicket: Ticket = {
      id: crypto.randomUUID(),
      ticketNumber: `HD-${1001 + tickets.length}`,
      title: form.title,
      priority: form.priority,
      status: 'Open',
      customerName: 'Priya Customer',
      createdAtUtc: new Date().toISOString(),
      slaDueAtUtc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    setTickets((current) => [optimisticTicket, ...current])
    setForm({ title: '', description: '', priority: 'Medium' })

    try {
      await fetch('https://localhost:7167/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          customerId,
          title: optimisticTicket.title,
          description: form.description,
          priority: form.priority,
        }),
      })
    } catch {
      // The UI remains useful even when the API is not running during frontend-only demos.
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Helpdesk SaaS</p>
          <h1>Acme Support</h1>
        </div>
        <nav aria-label="Primary">
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#tickets">Tickets</a>
          <a href="#agents">Agents</a>
          <a href="#settings">SLA Rules</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations overview</p>
            <h2>Ticket command center</h2>
          </div>
          <button type="button">Invite agent</button>
        </header>

        <section className="metrics" id="dashboard" aria-label="Dashboard summary">
          <article>
            <span>Open</span>
            <strong>{summary.open}</strong>
          </article>
          <article>
            <span>In progress</span>
            <strong>{summary.inProgress}</strong>
          </article>
          <article>
            <span>Resolved</span>
            <strong>{summary.resolved}</strong>
          </article>
          <article>
            <span>SLA risk</span>
            <strong>{summary.breached}</strong>
          </article>
        </section>

        <section className="content-grid">
          <section className="panel" id="tickets">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Queue</p>
                <h3>Support tickets</h3>
              </div>
              <div className="filters">
                <input
                  aria-label="Search tickets"
                  placeholder="Search ticket"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  aria-label="Filter by status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as 'All' | TicketStatus)}
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>InProgress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>

            <div className="ticket-list">
              {filteredTickets.map((ticket) => (
                <article className="ticket-row" key={ticket.id}>
                  <div>
                    <span className="ticket-number">{ticket.ticketNumber}</span>
                    <strong>{ticket.title}</strong>
                    <small>{ticket.customerName} -> {ticket.agentName ?? 'Unassigned'}</small>
                  </div>
                  <span className={`pill priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                  <span className="pill">{ticket.status}</span>
                  <span className="sla">{formatSla(ticket.slaDueAtUtc)}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">New request</p>
                <h3>Create ticket</h3>
              </div>
            </div>

            <form className="ticket-form" onSubmit={createTicket}>
              <label>
                Title
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Short issue title"
                />
              </label>
              <label>
                Description
                <textarea
                  required
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="What happened?"
                  rows={5}
                />
              </label>
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value as TicketPriority })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </label>
              <button type="submit">Create ticket</button>
            </form>
          </section>
        </section>
      </section>
    </main>
  )
}

function formatSla(value: string) {
  const dueAt = new Date(value)
  const hours = Math.round((dueAt.getTime() - Date.now()) / 36e5)

  if (hours < 0) {
    return `${Math.abs(hours)}h overdue`
  }

  return `${hours}h left`
}

export default App
