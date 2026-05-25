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

    public async Task<IReadOnlyList<Tenant>> GetAll()
    {
        return await _dbContext.Tenants
            .AsNoTracking()
            .OrderBy(tenant => tenant.Name)
            .ToListAsync();
    }
}
