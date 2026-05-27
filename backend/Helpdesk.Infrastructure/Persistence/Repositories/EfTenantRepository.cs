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

    public async Task<Tenant?> GetBySlug(string slug)
    {
        return await _dbContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(tenant => tenant.Slug == slug);
    }

    public async Task<Tenant?> GetById(Guid id)
    {
        return await _dbContext.Tenants.FindAsync(id);
    }

    public async Task<Tenant> Add(Tenant tenant)
    {
        _dbContext.Tenants.Add(tenant);
        await _dbContext.SaveChangesAsync();
        return tenant;
    }

    public async Task Update(Tenant tenant)
    {
        _dbContext.Tenants.Update(tenant);
        await _dbContext.SaveChangesAsync();
    }
}
