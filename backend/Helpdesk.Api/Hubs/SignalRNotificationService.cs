using Helpdesk.Application.Common;
using Helpdesk.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Helpdesk.Api.Services;

public class SignalRNotificationService
    : ISignalRNotificationService
{

    private readonly IHubContext<DashboardHub> _dashboardHubContext;
    private readonly IHubContext<CommentHub> _commentHubContext;

    public SignalRNotificationService(
        IHubContext<DashboardHub> dashboardHubContext,
        IHubContext<CommentHub> commentHubContext)
    {
        _dashboardHubContext = dashboardHubContext;
        _commentHubContext = commentHubContext;
    }

    public async Task NotifyTicketCreated(
        Guid tenantId,
        object data)
    {
        await _dashboardHubContext.Clients
            .Group($"tenant_{tenantId}")
            .SendAsync("TicketCreated", data);
    }

    public async Task NotifyTicketUpdated(
        Guid tenantId,
        object data)
    {
        await _dashboardHubContext.Clients
            .Group($"tenant_{tenantId}")
            .SendAsync("TicketUpdated", data);
    }

    public async Task NotifyCommentAdded(
        Guid tenantId,
        Guid ticketId,
        object data)
    {
        await _commentHubContext.Clients
            .Group($"ticket_{ticketId}")
            .SendAsync("CommentAdded", data);
    }
}