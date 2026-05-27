using Helpdesk.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SuperAdminController : ControllerBase
{
    private readonly TenantService _tenantService;

    public SuperAdminController(TenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet("tenants")]
    public async Task<IActionResult> GetTenantApplications()
    {
        var response = await _tenantService.GetTenantApplications();
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("tenants/{id}/approve")]
    public async Task<IActionResult> ApproveTenant(Guid id)
    {
        var response = await _tenantService.ApproveTenant(id);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("tenants/{id}/reject")]
    public async Task<IActionResult> RejectTenant(Guid id)
    {
        var response = await _tenantService.RejectTenant(id);
        return StatusCode(response.StatusCode, response);
    }
}
