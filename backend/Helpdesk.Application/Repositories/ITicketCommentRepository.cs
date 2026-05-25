using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface ITicketCommentRepository
{
    Task<IReadOnlyList<TicketComment>> GetByTicketId(Guid ticketId);
    Task<TicketComment> Add(TicketComment comment);
}
