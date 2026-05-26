using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface ITenantRepository
{
    Task<IReadOnlyList<Tenant>> GetAll();
}
