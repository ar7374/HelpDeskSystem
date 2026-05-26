using Microsoft.AspNetCore.SignalR;

namespace Helpdesk.Api.Hubs;

public class DashboardHub : Hub
{
    public async Task JoinTenantGroup(Guid tenantId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }

    public async Task LeaveTenantGroup(Guid tenantId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }
}