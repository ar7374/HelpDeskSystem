using System.Security.Claims;
using Helpdesk.Application.Repositories;
using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Helpdesk.Api.Hubs;

[Authorize]
public class CommentHub : Hub
{
    private readonly IUnitOfWork _unitOfWork;

    public CommentHub(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task JoinTicketGroup(Guid ticketId)
    {
        var tenantId = GetTenantId();
        var ticket = await _unitOfWork.Tickets.GetById(tenantId, ticketId);
        if (ticket is null || !CanAccessTicket(ticket))
        {
            throw new HubException("You are not allowed to join this ticket.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"ticket_{ticketId}");
    }

    public async Task LeaveTicketGroup(Guid ticketId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ticket_{ticketId}");
    }

    private Guid GetUserId()
    {
        return Guid.Parse(Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    private Guid GetTenantId()
    {
        return Guid.Parse(Context.User?.FindFirstValue("TenantId")!);
    }

    private string GetRole()
    {
        return Context.User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }

    private bool CanAccessTicket(Ticket ticket)
    {
        if (ticket.TenantId != GetTenantId())
        {
            return false;
        }

        var role = GetRole();
        var userId = GetUserId();

        if (role == UserRole.Admin.ToString())
        {
            return true;
        }

        if (role == UserRole.Agent.ToString())
        {
            return ticket.AgentId == userId;
        }

        return role == UserRole.Customer.ToString() && ticket.CustomerId == userId;
    }
}
