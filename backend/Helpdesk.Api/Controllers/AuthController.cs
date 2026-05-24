using Helpdesk.Application.Requests;
using Helpdesk.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var response = _authService.Login(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("refresh")]
    public IActionResult Refresh([FromBody] RefreshTokenRequest request)
    {
        var response = _authService.RefreshToken(request);
        return StatusCode(response.StatusCode, response);
    }
}
