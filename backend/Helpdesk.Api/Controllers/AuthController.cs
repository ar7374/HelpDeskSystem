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
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.Login(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var response = await _authService.RefreshToken(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("tenant/{slug}")]
    public async Task<IActionResult> GetTenantBySlug(string slug)
    {
        var response = await _authService.GetTenantBySlug(slug);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        var response = await _authService.GoogleLogin(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantRequest request)
    {
        var response = await _authService.RegisterTenant(request);
        return StatusCode(response.StatusCode, response);
    }
}
