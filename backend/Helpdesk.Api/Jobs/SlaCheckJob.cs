using Helpdesk.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Quartz;

namespace Helpdesk.Api.Jobs;

/// <summary>
/// Quartz job that monitors and detects SLA breaches in unresolved tickets.
/// Runs every 5 minutes to identify tickets that have exceeded their SLA due date.
/// </summary>
public class SlaCheckJob : IJob
{
    private readonly HelpdeskDbContext _context;
    private readonly ILogger<SlaCheckJob> _logger;

    public SlaCheckJob(HelpdeskDbContext context, ILogger<SlaCheckJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("[SLA Check] Job started at {Time}", DateTime.UtcNow);

        try
        {
            // Query unresolved tickets that have breached SLA
            var breachedTickets = await _context.Tickets
                .Where(t => t.ResolvedAtUtc == null &&           // Not resolved
                           t.SlaDueAtUtc < DateTime.UtcNow &&    // SLA due date has passed
                           !t.IsSlaBreached)                      // Not already marked as breached
                .ToListAsync();

            if (breachedTickets.Count == 0)
            {
                _logger.LogInformation("[SLA Check] No breached tickets found");
                return;
            }

            foreach (var ticket in breachedTickets)
            {
                ticket.IsSlaBreached = true;

                _logger.LogWarning("[SLA BREACHED] Ticket {TicketNumber} | Priority: {Priority} | Tenant: {TenantId} | BreachTime: {BreachTime}",
                    ticket.TicketNumber,
                    ticket.Priority,
                    ticket.TenantId,
                    (DateTime.UtcNow - ticket.SlaDueAtUtc).TotalMinutes);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("[SLA Check] Marked {Count} tickets as breached", breachedTickets.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SLA Check] Error occurred while checking SLA breaches");
            throw; 
        }
    }
}
