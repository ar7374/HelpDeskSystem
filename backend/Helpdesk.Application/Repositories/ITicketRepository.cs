using Helpdesk.Domain.Entities;
using Helpdesk.Application.Requests;
using Helpdesk.Application.Dtos;

namespace Helpdesk.Application.Repositories;

public interface ITicketRepository
{
    Task<IReadOnlyList<Ticket>> GetByTenantId(Guid tenantId);
    Task<PaginatedListDto<Ticket>> GetPaginated(
        SearchRequest<TicketSearchCriteria> request,
        Guid tenantId,
        Guid? customerId = null,
        Guid? agentId = null);
    Task<Ticket?> GetById(Guid tenantId, Guid ticketId);
    Task<Ticket> Add(Ticket ticket);
    Task<Ticket?> Update(Ticket ticket);
    Task<int> CountByTenantId(Guid tenantId);
}
