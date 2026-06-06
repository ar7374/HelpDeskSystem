using Helpdesk.Application.Repositories;
using Helpdesk.Application.Requests;
using Helpdesk.Application.Dtos;
using Helpdesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Infrastructure.Persistence.Repositories;

public class EfTicketRepository : ITicketRepository
{
    private readonly HelpdeskDbContext _dbContext;

    public EfTicketRepository(HelpdeskDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Ticket>> GetByTenantId(Guid tenantId)
    {
        return await _dbContext.Tickets
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId)
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<PaginatedListDto<Ticket>> GetPaginated(
        SearchRequest<TicketSearchCriteria> request,
        Guid tenantId,
        Guid? customerId = null,
        Guid? agentId = null)
    {
        var query = _dbContext.Tickets
            .AsNoTracking()
            .Where(ticket => ticket.TenantId == tenantId);

        if (customerId is not null)
        {
            query = query.Where(ticket => ticket.CustomerId == customerId);
        }

        if (agentId is not null)
        {
            query = query.Where(ticket => ticket.AgentId == agentId);
        }

        if (request.Criteria is not null)
        {
            if (request.Criteria.Status is not null)
            {
                query = query.Where(t => t.Status == request.Criteria.Status);
            }

            if (request.Criteria.Priority is not null)
            {
                query = query.Where(t => t.Priority == request.Criteria.Priority);
            }

            if (!string.IsNullOrWhiteSpace(request.Criteria.Search))
            {
                query = query.Where(t =>
                    t.TicketNumber.Contains(request.Criteria.Search) ||
                    t.Title.Contains(request.Criteria.Search));
            }
        }

        var totalRecords = await query.LongCountAsync();

        var sortField = string.IsNullOrWhiteSpace(request.SortBy) ? "CreatedAtUtc" : request.SortBy;
        
        var items = request.SortDirection == SortDirection.Asc
            ? await query.OrderBy(t => EF.Property<object>(t, sortField))
                   .Skip((request.PageNumber - 1) * request.PageSize)
                   .Take(request.PageSize)
                   .ToListAsync()
            : await query.OrderByDescending(t => EF.Property<object>(t, sortField))
                   .Skip((request.PageNumber - 1) * request.PageSize)
                   .Take(request.PageSize)
                   .ToListAsync();

        return new PaginatedListDto<Ticket>
        {
            Data = items,
            Size = request.PageSize,
            TotalRecords = totalRecords
        };
    }

    public async Task<Ticket?> GetById(Guid tenantId, Guid ticketId)
    {
        return await _dbContext.Tickets
            .SingleOrDefaultAsync(ticket => ticket.TenantId == tenantId && ticket.Id == ticketId);
    }

    public async Task<Ticket> Add(Ticket ticket)
    {
        _dbContext.Tickets.Add(ticket);
        await _dbContext.SaveChangesAsync();
        return ticket;
    }

    public async Task<Ticket?> Update(Ticket ticket)
    {
        _dbContext.Tickets.Update(ticket);
        await _dbContext.SaveChangesAsync();
        return ticket;
    }

    public async Task<int> CountByTenantId(Guid tenantId)
    {
        return await _dbContext.Tickets.CountAsync(ticket => ticket.TenantId == tenantId);
    }
}
