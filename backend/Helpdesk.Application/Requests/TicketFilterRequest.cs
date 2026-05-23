using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Requests;

public class TicketFilterRequest
{
    public Guid TenantId { get; set; }
    public TicketStatus? Status { get; set; }
    public TicketPriority? Priority { get; set; }
    public string? Search { get; set; }
}
