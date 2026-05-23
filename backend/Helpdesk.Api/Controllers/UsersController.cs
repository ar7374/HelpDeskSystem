using Helpdesk.Api.Constants;
using Helpdesk.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route(ApiRoutes.TenantUsers)]
public sealed class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public IActionResult GetUsers(Guid tenantId)
    {
        var response = _userService.GetUsers(tenantId);
        return StatusCode(response.StatusCode, response);
    }
}
