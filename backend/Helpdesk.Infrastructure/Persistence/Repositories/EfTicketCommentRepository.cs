using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Infrastructure.Persistence.Repositories;

public class EfTicketCommentRepository : ITicketCommentRepository
{
    private readonly HelpdeskDbContext _dbContext;

    public EfTicketCommentRepository(HelpdeskDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IReadOnlyList<TicketComment> GetByTicketId(Guid ticketId)
    {
        return _dbContext.TicketComments
            .AsNoTracking()
            .Where(comment => comment.TicketId == ticketId)
            .OrderBy(comment => comment.CreatedAtUtc)
            .ToList();
    }

    public TicketComment Add(TicketComment comment)
    {
        _dbContext.TicketComments.Add(comment);
        _dbContext.SaveChanges();
        return comment;
    }
}
