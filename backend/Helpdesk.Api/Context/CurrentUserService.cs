using System.Security.Claims;
using Helpdesk.Application.Common;
using Microsoft.AspNetCore.Http;
namespace Helpdesk.Api.Context;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId =>
        Guid.Parse(_httpContextAccessor.HttpContext?
            .User
            .FindFirstValue(ClaimTypes.NameIdentifier)!);

    public Guid TenantId =>
        Guid.Parse(_httpContextAccessor.HttpContext?
            .User
            .FindFirstValue("TenantId")!);

    public string Role =>
        _httpContextAccessor.HttpContext?
            .User
            .FindFirstValue(ClaimTypes.Role)!;
}