using Helpdesk.Api.Constants;
using Helpdesk.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route(ApiRoutes.TenantDashboard)]
public sealed class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public DashboardController(DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public IActionResult GetDashboard(Guid tenantId)
    {
        var response = _dashboardService.GetDashboard(tenantId);
        return StatusCode(response.StatusCode, response);
    }
}
