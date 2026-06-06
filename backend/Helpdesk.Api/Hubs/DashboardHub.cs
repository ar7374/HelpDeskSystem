using System.Security.Claims;
using Helpdesk.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Helpdesk.Api.Hubs;

[Authorize]
public class DashboardHub : Hub
{
    public async Task JoinTenantGroup(Guid tenantId)
    {
        if (!CanJoinTenantDashboard(tenantId))
        {
            throw new HubException("You are not allowed to join this dashboard.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }

    public async Task LeaveTenantGroup(Guid tenantId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }

    private bool CanJoinTenantDashboard(Guid tenantId)
    {
        var currentTenantId = Guid.Parse(Context.User?.FindFirstValue("TenantId")!);
        var role = Context.User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        return tenantId == currentTenantId &&
            role is nameof(UserRole.Admin) or nameof(UserRole.Agent);
    }
}
