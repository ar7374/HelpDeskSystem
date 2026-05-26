using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface IUserRepository
{
    Task<IReadOnlyList<User>> GetByTenantId(Guid tenantId);
    Task<User?> GetById(Guid userId);
    Task<User?> GetByEmail(string email, Guid tenantId);
    Task<User?> GetByRefreshToken(string refreshToken);
    Task Update(User user);
}
