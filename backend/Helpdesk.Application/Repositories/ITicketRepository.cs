using Helpdesk.Domain.Entities;
using Helpdesk.Application.Requests;

namespace Helpdesk.Application.Repositories;

public interface ITicketRepository
{
    IReadOnlyList<Ticket> GetByFilter(TicketFilterRequest request);
    Ticket? GetById(Guid tenantId, Guid ticketId);
    Ticket Add(Ticket ticket);
    Ticket? Update(Ticket ticket);
    int CountByTenantId(Guid tenantId);
}
