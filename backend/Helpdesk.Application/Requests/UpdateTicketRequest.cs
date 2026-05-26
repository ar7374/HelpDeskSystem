using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Requests;

public class UpdateTicketRequest
{
    public TicketStatus Status { get; set; }
    public Guid? AgentId { get; set; }
}
