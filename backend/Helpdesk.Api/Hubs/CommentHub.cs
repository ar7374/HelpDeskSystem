using Microsoft.AspNetCore.SignalR;

namespace Helpdesk.Api.Hubs;

public class CommentHub : Hub
{
    public async Task JoinTicketGroup(Guid ticketId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"ticket_{ticketId}");
    }

    public async Task LeaveTicketGroup(Guid ticketId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ticket_{ticketId}");
    }
}
