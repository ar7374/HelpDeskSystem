using Helpdesk.Api.Constants;
using Helpdesk.Api.Context;
using Helpdesk.Application.Common;
using Helpdesk.Application.Services;
using Helpdesk.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route(ApiRoutes.TenantDashboard)]
[Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Agent)}")]public sealed class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    private readonly ICurrentUserService _currentUserService;

    public DashboardController(DashboardService dashboardService, ICurrentUserService currentUserService)
    {
        _dashboardService = dashboardService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public IActionResult GetDashboard()
    {
        var tenantId = _currentUserService.TenantId;

        var response = _dashboardService.GetDashboard(tenantId);

        return StatusCode(response.StatusCode, response);
    }
}
