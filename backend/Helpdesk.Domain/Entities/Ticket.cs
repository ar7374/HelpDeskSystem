using Helpdesk.Domain.Enums;

namespace Helpdesk.Domain.Entities;

public class Ticket
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? AgentId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime SlaDueAtUtc { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }
}
