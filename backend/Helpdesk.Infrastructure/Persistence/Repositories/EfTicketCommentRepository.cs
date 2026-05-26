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

    public async Task<IReadOnlyList<TicketComment>> GetByTicketId(Guid ticketId)
    {
        return await _dbContext.TicketComments
            .AsNoTracking()
            .Where(comment => comment.TicketId == ticketId)
            .OrderBy(comment => comment.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<TicketComment> Add(TicketComment comment)
    {
        _dbContext.TicketComments.Add(comment);
        await _dbContext.SaveChangesAsync();
        return comment;
    }
}
