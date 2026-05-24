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

    public IReadOnlyList<User> GetByTenantId(Guid tenantId)
    {
        return _dbContext.Users
            .AsNoTracking()
            .Where(user => user.TenantId == tenantId)
            .OrderBy(user => user.Role)
            .ThenBy(user => user.FullName)
            .ToList();
    }

    public User? GetById(Guid userId)
    {
        return _dbContext.Users
            .AsNoTracking()
            .SingleOrDefault(user => user.Id == userId);
    }

    public User? GetByEmail(string email, Guid tenantId)
    {
        return _dbContext.Users
            .AsNoTracking()
            .SingleOrDefault(user => user.Email == email && user.TenantId == tenantId);
    }

    public User? GetByRefreshToken(string refreshToken)
    {
        return _dbContext.Users
            .AsNoTracking()
            .SingleOrDefault(user => user.RefreshToken == refreshToken);
    }

    public void Update(User user)
    {
        _dbContext.Users.Update(user);
        _dbContext.SaveChanges();
    }
}
