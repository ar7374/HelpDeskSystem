using Helpdesk.Api.Constants;
using Helpdesk.Application.Common;
using Helpdesk.Application.Services;
using Helpdesk.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route(ApiRoutes.AuditLogs)]
[Authorize(Roles =RoleConstants.Admin)]
public sealed class AuditLogsController : ControllerBase
{
    private readonly AuditService _auditService;
    private readonly ICurrentUserService _currentUserService;

    public AuditLogsController(
        AuditService auditService,
        ICurrentUserService currentUserService)
    {
        _auditService = auditService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public IActionResult GetAuditLogs()
    {
        var tenantId = _currentUserService.TenantId;

        var response = _auditService.GetLogs(tenantId);

        return StatusCode(response.StatusCode, response);
    }
}