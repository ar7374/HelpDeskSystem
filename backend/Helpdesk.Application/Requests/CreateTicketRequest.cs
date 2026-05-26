using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Requests;

public class CreateTicketRequest
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
}
