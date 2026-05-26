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

    public async Task Add(AuditLog auditLog)
    {
        _dbContext.AuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<AuditLog>> GetByTenantId(Guid tenantId)
    {
        return await _dbContext.AuditLogs
            .AsNoTracking()
            .Where(log => log.TenantId == tenantId)
            .OrderByDescending(log => log.CreatedAtUtc)
            .ToListAsync();
    }
}