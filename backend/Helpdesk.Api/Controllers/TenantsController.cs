using Helpdesk.Api.Constants;
using Helpdesk.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route(ApiRoutes.Tenants)]
[Authorize]
public sealed class TenantsController : ControllerBase
{
    private readonly TenantService _tenantService;

    public TenantsController(TenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet]
    public IActionResult GetTenants()
    {
        var response = _tenantService.GetTenants();
        return StatusCode(response.StatusCode, response);
    }
}
