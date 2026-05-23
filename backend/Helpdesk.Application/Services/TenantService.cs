using Helpdesk.Application.Constants;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Responses;
using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Services;

public sealed class TenantService
{
    private readonly IUnitOfWork _unitOfWork;

    public TenantService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public ApiResponse<IReadOnlyList<Tenant>> GetTenants()
    {
        var tenants = _unitOfWork.Tenants.GetAll();
        return ApiResponse<IReadOnlyList<Tenant>>.Success(ResponseMessages.Success.TenantsFetched, tenants);
    }
}
