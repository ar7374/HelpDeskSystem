using Helpdesk.Application.Constants;
using Helpdesk.Application.Dtos;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Requests;
using Helpdesk.Application.Responses;
using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Services;

public sealed class DashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public ApiResponse<DashboardSummary> GetDashboard(Guid tenantId)
    {
        var tickets = _unitOfWork.Tickets.GetByTenantId(tenantId);
        var resolvedTickets = tickets.Where(ticket => ticket.ResolvedAtUtc is not null).ToList();
        var averageResolutionHours = resolvedTickets.Count == 0
            ? 0
            : resolvedTickets.Average(ticket => (ticket.ResolvedAtUtc!.Value - ticket.CreatedAtUtc).TotalHours);

        var dashboard = new DashboardSummary
        {
            OpenTickets = tickets.Count(ticket => ticket.Status == TicketStatus.Open),
            InProgressTickets = tickets.Count(ticket => ticket.Status == TicketStatus.InProgress),
            ResolvedTickets = tickets.Count(ticket => ticket.Status is TicketStatus.Resolved or TicketStatus.Closed),
            SlaBreachedTickets = tickets.Count(ticket => ticket.ResolvedAtUtc is null && ticket.SlaDueAtUtc < DateTime.UtcNow),
            AverageResolutionHours = Math.Round(averageResolutionHours, 1),
            TicketsByPriority = tickets.GroupBy(ticket => ticket.Priority).ToDictionary(group => group.Key, group => group.Count())
        };

        return ApiResponse<DashboardSummary>.Success(ResponseMessages.Success.DashboardFetched, dashboard);
    }
}
