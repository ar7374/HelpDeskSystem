using Helpdesk.Domain.Enums;

namespace Helpdesk.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public TenantStatus Status { get; set; } = TenantStatus.Pending;
    public DateTime CreatedAtUtc { get; set; }
}
