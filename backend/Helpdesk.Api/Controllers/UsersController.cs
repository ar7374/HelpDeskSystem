using Helpdesk.Api.Constants;
using Helpdesk.Api.Context;
using Helpdesk.Application.Common;
using Helpdesk.Application.Services;
using Helpdesk.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route(ApiRoutes.TenantUsers)]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(
        UserService userService,
        ICurrentUserService currentUserService)
    {
        _userService = userService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var tenantId = _currentUserService.TenantId;

        var response = await _userService.GetUsers(tenantId);

        return StatusCode(response.StatusCode, response);
    }
}