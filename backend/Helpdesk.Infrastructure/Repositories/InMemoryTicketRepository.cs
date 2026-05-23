using Helpdesk.Application.Repositories;
using Helpdesk.Application.Requests;
using Helpdesk.Domain.Entities;
using Helpdesk.Infrastructure.Data;

namespace Helpdesk.Infrastructure.Repositories;

public sealed class InMemoryTicketRepository : ITicketRepository
{
    private readonly InMemoryHelpdeskDataStore _dataStore;

    public InMemoryTicketRepository(InMemoryHelpdeskDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    public IReadOnlyList<Ticket> GetByFilter(TicketFilterRequest request)
    {
        var query = _dataStore.Tickets.Where(ticket => ticket.TenantId == request.TenantId);

        if (request.Status is not null)
        {
            query = query.Where(ticket => ticket.Status == request.Status);
        }

        if (request.Priority is not null)
        {
            query = query.Where(ticket => ticket.Priority == request.Priority);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(ticket =>
                ticket.TicketNumber.Contains(request.Search, StringComparison.OrdinalIgnoreCase) ||
                ticket.Title.Contains(request.Search, StringComparison.OrdinalIgnoreCase));
        }

        return query.OrderByDescending(ticket => ticket.CreatedAtUtc).ToList();
    }

    public Ticket? GetById(Guid tenantId, Guid ticketId)
    {
        return _dataStore.Tickets.SingleOrDefault(ticket => ticket.TenantId == tenantId && ticket.Id == ticketId);
    }

    public Ticket Add(Ticket ticket)
    {
        _dataStore.Tickets.Add(ticket);
        return ticket;
    }

    public Ticket? Update(Ticket ticket)
    {
        var index = _dataStore.Tickets.FindIndex(item => item.Id == ticket.Id && item.TenantId == ticket.TenantId);
        if (index < 0)
        {
            return null;
        }

        _dataStore.Tickets[index] = ticket;
        return ticket;
    }

    public int CountByTenantId(Guid tenantId)
    {
        return _dataStore.Tickets.Count(ticket => ticket.TenantId == tenantId);
    }
}
