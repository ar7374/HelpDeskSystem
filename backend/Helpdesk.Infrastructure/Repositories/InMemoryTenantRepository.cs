using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Helpdesk.Infrastructure.Data;

namespace Helpdesk.Infrastructure.Repositories;

public sealed class InMemoryTenantRepository : ITenantRepository
{
    private readonly InMemoryHelpdeskDataStore _dataStore;

    public InMemoryTenantRepository(InMemoryHelpdeskDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    public IReadOnlyList<Tenant> GetAll()
    {
        return _dataStore.Tenants.OrderBy(tenant => tenant.Name).ToList();
    }
}
