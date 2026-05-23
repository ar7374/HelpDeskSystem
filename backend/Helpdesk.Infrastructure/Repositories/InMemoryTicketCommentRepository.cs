using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Helpdesk.Infrastructure.Data;

namespace Helpdesk.Infrastructure.Repositories;

public sealed class InMemoryTicketCommentRepository : ITicketCommentRepository
{
    private readonly InMemoryHelpdeskDataStore _dataStore;

    public InMemoryTicketCommentRepository(InMemoryHelpdeskDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    public IReadOnlyList<TicketComment> GetByTicketId(Guid ticketId)
    {
        return _dataStore.Comments
            .Where(comment => comment.TicketId == ticketId)
            .OrderBy(comment => comment.CreatedAtUtc)
            .ToList();
    }

    public TicketComment Add(TicketComment comment)
    {
        _dataStore.Comments.Add(comment);
        return comment;
    }
}
