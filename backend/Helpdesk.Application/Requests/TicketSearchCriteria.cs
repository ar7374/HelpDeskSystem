using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Requests;

public class TicketSearchCriteria
{
    public TicketStatus? Status { get; set; }
    public TicketPriority? Priority { get; set; }
    public string? Search { get; set; }
}
