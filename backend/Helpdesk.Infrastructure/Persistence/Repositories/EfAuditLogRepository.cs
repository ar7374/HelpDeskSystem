using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Infrastructure.Persistence.Repositories;

public class EfAuditLogRepository : IAuditLogRepository
{
    private readonly HelpdeskDbContext _dbContext;

    public EfAuditLogRepository(HelpdeskDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void Add(AuditLog auditLog)
    {
        _dbContext.AuditLogs.Add(auditLog);
        _dbContext.SaveChanges();
    }

    public IReadOnlyList<AuditLog> GetByTenantId(Guid tenantId)
    {
        return _dbContext.AuditLogs
            .AsNoTracking()
            .Where(log => log.TenantId == tenantId)
            .OrderByDescending(log => log.CreatedAtUtc)
            .ToList();
    }
}