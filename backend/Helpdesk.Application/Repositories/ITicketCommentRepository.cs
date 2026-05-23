using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface ITicketCommentRepository
{
    IReadOnlyList<TicketComment> GetByTicketId(Guid ticketId);
    TicketComment Add(TicketComment comment);
}
