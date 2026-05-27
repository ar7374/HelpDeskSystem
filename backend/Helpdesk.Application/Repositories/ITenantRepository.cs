using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface ITenantRepository
{
    Task<IReadOnlyList<Tenant>> GetAll();
    Task<Tenant?> GetBySlug(string slug);
    Task<Tenant?> GetById(Guid id);
    Task<Tenant> Add(Tenant tenant);
    Task Update(Tenant tenant);
}
