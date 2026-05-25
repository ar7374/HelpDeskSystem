using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface IAuditLogRepository
{
    Task Add(AuditLog auditLog);

    Task<IReadOnlyList<AuditLog>> GetByTenantId(Guid tenantId);
}