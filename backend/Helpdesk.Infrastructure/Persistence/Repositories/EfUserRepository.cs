using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Infrastructure.Persistence.Repositories;

public class EfUserRepository : IUserRepository
{
    private readonly HelpdeskDbContext _dbContext;

    public EfUserRepository(HelpdeskDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<User>> GetByTenantId(Guid tenantId)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.TenantId == tenantId)
            .OrderBy(user => user.Role)
            .ThenBy(user => user.FullName)
            .ToListAsync();
    }

    public async Task<User?> GetById(Guid userId)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(user => user.Id == userId);
    }

    public async Task<User?> GetByEmail(string email, Guid tenantId)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(user => user.Email == email && user.TenantId == tenantId);
    }

    public async Task<User?> GetByRefreshToken(string refreshToken)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(user => user.RefreshToken == refreshToken);
    }

    public async Task Update(User user)
    {
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<User> Add(User user)
    {
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();
        return user;
    }
}
