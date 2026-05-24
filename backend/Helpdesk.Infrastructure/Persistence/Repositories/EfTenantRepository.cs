using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Infrastructure.Persistence.Repositories;

public class EfTenantRepository : ITenantRepository
{
    private readonly HelpdeskDbContext _dbContext;

    public EfTenantRepository(HelpdeskDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IReadOnlyList<Tenant> GetAll()
    {
        return _dbContext.Tenants
            .AsNoTracking()
            .OrderBy(tenant => tenant.Name)
            .ToList();
    }
}
