using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Dtos;

public class TicketDetails
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }
    public User Customer { get; set; } = new();
    public User? Agent { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime SlaDueAtUtc { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }
    public IReadOnlyList<TicketComment> Comments { get; set; } = [];
}
