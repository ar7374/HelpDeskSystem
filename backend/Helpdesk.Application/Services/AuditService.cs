using Helpdesk.Application.Repositories;
using Helpdesk.Application.Responses;
using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Services;

public class AuditService
{
    private readonly IUnitOfWork _unitOfWork;

    public AuditService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public void Log(
        Guid tenantId,
        Guid userId,
        string action,
        string entityType,
        Guid entityId,
        string description)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Description = description,
            CreatedAtUtc = DateTime.UtcNow
        };

        _unitOfWork.AuditLogs.Add(auditLog);
    }
    public ApiResponse<IReadOnlyList<AuditLog>> GetLogs(Guid tenantId)
    {
        var logs = _unitOfWork.AuditLogs.GetByTenantId(tenantId);

        return ApiResponse<IReadOnlyList<AuditLog>>.Success(
            "Audit logs fetched successfully",
            logs);
    }

}