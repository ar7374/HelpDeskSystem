using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Dtos;

public class TicketListItem
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? AgentName { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime SlaDueAtUtc { get; set; }
}
