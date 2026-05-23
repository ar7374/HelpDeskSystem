using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Dtos;

public class DashboardSummary
{
    public int OpenTickets { get; set; }
    public int InProgressTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int SlaBreachedTickets { get; set; }
    public double AverageResolutionHours { get; set; }
    public IReadOnlyDictionary<TicketPriority, int> TicketsByPriority { get; set; } =
        new Dictionary<TicketPriority, int>();
}
