using Helpdesk.Application.Common;
using Helpdesk.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Helpdesk.Api.Services;

public class SignalRNotificationService
    : ISignalRNotificationService
{
    private readonly IHubContext<DashboardHub> _hubContext;

    public SignalRNotificationService(
        IHubContext<DashboardHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyTicketCreated(
        Guid tenantId,
        object data)
    {
        await _hubContext.Clients
            .Group($"tenant_{tenantId}")
            .SendAsync("TicketCreated", data);
    }

    public async Task NotifyTicketUpdated(
        Guid tenantId,
        object data)
    {
        await _hubContext.Clients
            .Group($"tenant_{tenantId}")
            .SendAsync("TicketUpdated", data);
    }
}