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

    public IReadOnlyList<Ticket> GetByTenantId(Guid tenantId)
    {
        return _dbContext.Tickets
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId)
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToList();
    }

    public PaginatedListDto<Ticket> GetPaginated(SearchRequest<TicketSearchCriteria> request, Guid tenantId)
    {
        var query = _dbContext.Tickets
            .AsNoTracking()
            .Where(ticket => ticket.TenantId == tenantId);

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

        var totalRecords = query.LongCount();

        var sortField = string.IsNullOrWhiteSpace(request.SortBy) ? "CreatedAtUtc" : request.SortBy;
        
        var items = request.SortDirection == SortDirection.Asc
            ? query.OrderBy(t => EF.Property<object>(t, sortField))
                   .Skip((request.PageNumber - 1) * request.PageSize)
                   .Take(request.PageSize)
                   .ToList()
            : query.OrderByDescending(t => EF.Property<object>(t, sortField))
                   .Skip((request.PageNumber - 1) * request.PageSize)
                   .Take(request.PageSize)
                   .ToList();

        return new PaginatedListDto<Ticket>
        {
            Data = items,
            Size = request.PageSize,
            TotalRecords = totalRecords
        };
    }

    public Ticket? GetById(Guid tenantId, Guid ticketId)
    {
        return _dbContext.Tickets
            .SingleOrDefault(ticket => ticket.TenantId == tenantId && ticket.Id == ticketId);
    }

    public Ticket Add(Ticket ticket)
    {
        _dbContext.Tickets.Add(ticket);
        _dbContext.SaveChanges();
        return ticket;
    }

    public Ticket? Update(Ticket ticket)
    {
        _dbContext.Tickets.Update(ticket);
        _dbContext.SaveChanges();
        return ticket;
    }

    public int CountByTenantId(Guid tenantId)
    {
        return _dbContext.Tickets.Count(ticket => ticket.TenantId == tenantId);
    }
}
