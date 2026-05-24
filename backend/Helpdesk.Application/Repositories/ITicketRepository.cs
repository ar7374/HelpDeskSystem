using Helpdesk.Domain.Entities;
using Helpdesk.Application.Requests;
using Helpdesk.Application.Dtos;

namespace Helpdesk.Application.Repositories;

public interface ITicketRepository
{
    IReadOnlyList<Ticket> GetByTenantId(Guid tenantId);
    PaginatedListDto<Ticket> GetPaginated(SearchRequest<TicketSearchCriteria> request, Guid tenantId);
    Ticket? GetById(Guid tenantId, Guid ticketId);
    Ticket Add(Ticket ticket);
    Ticket? Update(Ticket ticket);
    int CountByTenantId(Guid tenantId);
}
