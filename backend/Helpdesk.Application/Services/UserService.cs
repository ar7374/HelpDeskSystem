using Helpdesk.Application.Constants;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Responses;
using Helpdesk.Domain.Entities;

namespace Helpdesk.Application.Services;

public sealed class UserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<IReadOnlyList<User>>> GetUsers(Guid tenantId)
    {
        var users = await _unitOfWork.Users.GetByTenantId(tenantId);
        return ApiResponse<IReadOnlyList<User>>.Success(ResponseMessages.Success.UsersFetched, users);
    }
}
