using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Helpdesk.Infrastructure.Data;

namespace Helpdesk.Infrastructure.Repositories;

public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly InMemoryHelpdeskDataStore _dataStore;

    public InMemoryUserRepository(InMemoryHelpdeskDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    public IReadOnlyList<User> GetByTenantId(Guid tenantId)
    {
        return _dataStore.Users
            .Where(user => user.TenantId == tenantId)
            .OrderBy(user => user.Role)
            .ThenBy(user => user.FullName)
            .ToList();
    }

    public User? GetById(Guid userId)
    {
        return _dataStore.Users.SingleOrDefault(user => user.Id == userId);
    }
}
