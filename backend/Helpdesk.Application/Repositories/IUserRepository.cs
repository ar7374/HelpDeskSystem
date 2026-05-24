using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface IUserRepository
{
    IReadOnlyList<User> GetByTenantId(Guid tenantId);
    User? GetById(Guid userId);
    User? GetByEmail(string email, Guid tenantId);
    User? GetByRefreshToken(string refreshToken);
    void Update(User user);
}
