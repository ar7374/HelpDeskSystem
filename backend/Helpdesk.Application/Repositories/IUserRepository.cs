using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface IUserRepository
{
    IReadOnlyList<User> GetByTenantId(Guid tenantId);
    User? GetById(Guid userId);
}
