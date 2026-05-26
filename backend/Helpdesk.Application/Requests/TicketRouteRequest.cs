namespace Helpdesk.Application.Requests;

public class TicketRouteRequest
{
    public Guid TenantId { get; set; }
    public Guid TicketId { get; set; }
}
