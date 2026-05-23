using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Repositories;

public interface ITenantRepository
{
    IReadOnlyList<Tenant> GetAll();
}
