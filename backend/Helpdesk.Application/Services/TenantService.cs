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

    public async Task<ApiResponse<IReadOnlyList<Tenant>>> GetTenants()
    {
        var tenants = await _unitOfWork.Tenants.GetAll();
        return ApiResponse<IReadOnlyList<Tenant>>.Success(ResponseMessages.Success.TenantsFetched, tenants);
    }

    public async Task<ApiResponse<IReadOnlyList<TenantApprovalDto>>> GetTenantApplications()
    {
        var tenants = await _unitOfWork.Tenants.GetAll();
        var list = new List<TenantApprovalDto>();

        foreach (var tenant in tenants)
        {
            // Skip the super-admin system tenant
            if (tenant.Slug == "super-admin") continue;

            var users = await _unitOfWork.Users.GetByTenantId(tenant.Id);
            var founder = users.FirstOrDefault(u => u.Role == Helpdesk.Domain.Enums.UserRole.Admin);

            list.Add(new TenantApprovalDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug,
                Status = tenant.Status.ToString(),
                CreatedAtUtc = tenant.CreatedAtUtc,
                FounderName = founder?.FullName ?? "Unknown",
                FounderEmail = founder?.Email ?? "Unknown"
            });
        }

        return ApiResponse<IReadOnlyList<TenantApprovalDto>>.Success("Tenant applications fetched successfully.", list);
    }

    public async Task<ApiResponse<string>> ApproveTenant(Guid tenantId)
    {
        var tenant = await _unitOfWork.Tenants.GetById(tenantId);
        if (tenant == null)
        {
            return new ApiResponse<string>
            {
                StatusCode = 404,
                Message = "Tenant workspace not found.",
                Status = false
            };
        }

        tenant.Status = Helpdesk.Domain.Enums.TenantStatus.Approved;
        await _unitOfWork.Tenants.Update(tenant);

        return ApiResponse<string>.Success("Tenant workspace approved successfully.", tenant.Slug);
    }

    public async Task<ApiResponse<string>> RejectTenant(Guid tenantId)
    {
        var tenant = await _unitOfWork.Tenants.GetById(tenantId);
        if (tenant == null)
        {
            return new ApiResponse<string>
            {
                StatusCode = 404,
                Message = "Tenant workspace not found.",
                Status = false
            };
        }

        tenant.Status = Helpdesk.Domain.Enums.TenantStatus.Rejected;
        await _unitOfWork.Tenants.Update(tenant);

        return ApiResponse<string>.Success("Tenant workspace rejected successfully.", tenant.Slug);
    }
}
