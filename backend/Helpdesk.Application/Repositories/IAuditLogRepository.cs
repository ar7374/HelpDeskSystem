using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface IAuditLogRepository
{
    void Add(AuditLog auditLog);

    IReadOnlyList<AuditLog> GetByTenantId(Guid tenantId);
}