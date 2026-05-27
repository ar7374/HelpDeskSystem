using Helpdesk.Application.Constants;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Responses;
using Helpdesk.Application.Requests;
using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Services;

public sealed class UserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHashService _passwordHashService;

    public UserService(IUnitOfWork unitOfWork, IPasswordHashService passwordHashService)
    {
        _unitOfWork = unitOfWork;
        _passwordHashService = passwordHashService;
    }

    public async Task<ApiResponse<IReadOnlyList<User>>> GetUsers(Guid tenantId)
    {
        var users = await _unitOfWork.Users.GetByTenantId(tenantId);
        return ApiResponse<IReadOnlyList<User>>.Success(ResponseMessages.Success.UsersFetched, users);
    }

    public async Task<ApiResponse<User>> CreateUser(CreateUserRequest request, Guid tenantId)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Role))
        {
            return new ApiResponse<User>
            {
                StatusCode = 400,
                Message = "Full name, email, and role are required.",
                Status = false
            };
        }

        var existingUser = await _unitOfWork.Users.GetByEmail(request.Email.Trim().ToLower(), tenantId);
        if (existingUser != null)
        {
            return new ApiResponse<User>
            {
                StatusCode = 400,
                Message = "A user with this email address already exists under your company.",
                Status = false
            };
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var parsedRole))
        {
            return new ApiResponse<User>
            {
                StatusCode = 400,
                Message = "Invalid role selection. Available roles are Admin, Agent, Customer.",
                Status = false
            };
        }

        var passwordToHash = string.IsNullOrWhiteSpace(request.Password) ? Guid.NewGuid().ToString() : request.Password;
        var user = new User
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = _passwordHashService.HashPassword(passwordToHash),
            Role = parsedRole,
            CreatedAtUtc = DateTime.UtcNow
        };

        var createdUser = await _unitOfWork.Users.Add(user);

        return ApiResponse<User>.Success("Employee account created successfully.", createdUser);
    }

    public async Task<ApiResponse<User>> UpdateUserRole(Guid userId, UpdateUserRoleRequest request, Guid tenantId)
    {
        if (string.IsNullOrWhiteSpace(request.Role))
        {
            return new ApiResponse<User>
            {
                StatusCode = 400,
                Message = "Role is required.",
                Status = false
            };
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var parsedRole))
        {
            return new ApiResponse<User>
            {
                StatusCode = 400,
                Message = "Invalid role selection. Available roles are Admin, Agent, Customer.",
                Status = false
            };
        }

        // Find employee and verify tenant boundaries
        var user = await _unitOfWork.Users.GetById(userId);
        if (user == null || user.TenantId != tenantId)
        {
            return new ApiResponse<User>
            {
                StatusCode = 404,
                Message = "User not found in your company.",
                Status = false
            };
        }

        user.Role = parsedRole;
        await _unitOfWork.Users.Update(user);

        return ApiResponse<User>.Success("Employee role updated successfully.", user);
    }
}
