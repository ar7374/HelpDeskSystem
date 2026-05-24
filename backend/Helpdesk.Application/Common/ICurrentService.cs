namespace Helpdesk.Application.Common;

public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid TenantId { get; }
    string Role { get; }
}