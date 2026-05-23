using Helpdesk.Application.Constants;
using Helpdesk.Application.Dtos;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Requests;
using Helpdesk.Application.Responses;
using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;

namespace Helpdesk.Application.Services;

public sealed class TicketService
{
    private readonly IUnitOfWork _unitOfWork;

    public TicketService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public ApiResponse<IReadOnlyList<TicketListItem>> GetTickets(TicketFilterRequest request)
    {
        var tickets = _unitOfWork.Tickets
            .GetByFilter(request)
            .Select(ToListItem)
            .ToList();

        return ApiResponse<IReadOnlyList<TicketListItem>>.Success(ResponseMessages.Success.TicketsFetched, tickets);
    }

    public ApiResponse<TicketDetails> GetTicket(TicketRouteRequest request)
    {
        var ticket = _unitOfWork.Tickets.GetById(request.TenantId, request.TicketId);
        if (ticket is null)
        {
            return ApiResponse<TicketDetails>.NotFound(ResponseMessages.Error.TicketNotFound);
        }

        return ApiResponse<TicketDetails>.Success(ResponseMessages.Success.TicketFetched, ToDetails(ticket));
    }

    public ApiResponse<TicketDetails> CreateTicket(CreateTicketRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
        {
            return ApiResponse<TicketDetails>.BadRequest(ResponseMessages.Error.TitleAndDescriptionRequired);
        }

        var ticketCount = _unitOfWork.Tickets.CountByTenantId(request.TenantId);
        var now = DateTime.UtcNow;

        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            TicketNumber = $"HD-{ticketCount + 1001}",
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Priority = request.Priority,
            Status = TicketStatus.Open,
            CustomerId = request.CustomerId,
            CreatedAtUtc = now,
            SlaDueAtUtc = now.AddHours(GetSlaHours(request.Priority))
        };

        _unitOfWork.Tickets.Add(ticket);
        return ApiResponse<TicketDetails>.Created(ResponseMessages.Success.TicketCreated, ToDetails(ticket));
    }

    public ApiResponse<TicketDetails> UpdateTicket(UpdateTicketCommand command)
    {
        var ticket = _unitOfWork.Tickets.GetById(command.Route.TenantId, command.Route.TicketId);
        if (ticket is null)
        {
            return ApiResponse<TicketDetails>.NotFound(ResponseMessages.Error.TicketNotFound);
        }

        DateTime? resolvedAt = command.Request.Status is TicketStatus.Resolved or TicketStatus.Closed
            ? ticket.ResolvedAtUtc ?? DateTime.UtcNow
            : null;

        ticket.Status = command.Request.Status;
        ticket.AgentId = command.Request.AgentId;
        ticket.ResolvedAtUtc = resolvedAt;

        _unitOfWork.Tickets.Update(ticket);
        return ApiResponse<TicketDetails>.Success(ResponseMessages.Success.TicketUpdated, ToDetails(ticket));
    }

    public ApiResponse<TicketDetails> AddComment(AddCommentCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Request.Body))
        {
            return ApiResponse<TicketDetails>.BadRequest(ResponseMessages.Error.CommentBodyRequired);
        }

        var ticket = _unitOfWork.Tickets.GetById(command.Route.TenantId, command.Route.TicketId);
        if (ticket is null)
        {
            return ApiResponse<TicketDetails>.NotFound(ResponseMessages.Error.TicketNotFound);
        }

        var comment = new TicketComment
        {
            Id = Guid.NewGuid(),
            TicketId = command.Route.TicketId,
            AuthorId = command.Request.AuthorId,
            Body = command.Request.Body.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _unitOfWork.TicketComments.Add(comment);
        return ApiResponse<TicketDetails>.Success(ResponseMessages.Success.CommentAdded, ToDetails(ticket));
    }

    private TicketListItem ToListItem(Ticket ticket)
    {
        var customer = _unitOfWork.Users.GetById(ticket.CustomerId)!;
        var agent = ticket.AgentId is null ? null : _unitOfWork.Users.GetById(ticket.AgentId.Value);

        return new TicketListItem
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CustomerName = customer.FullName,
            AgentName = agent?.FullName,
            CreatedAtUtc = ticket.CreatedAtUtc,
            SlaDueAtUtc = ticket.SlaDueAtUtc
        };
    }

    private TicketDetails ToDetails(Ticket ticket)
    {
        var customer = _unitOfWork.Users.GetById(ticket.CustomerId)!;
        var agent = ticket.AgentId is null ? null : _unitOfWork.Users.GetById(ticket.AgentId.Value);
        var comments = _unitOfWork.TicketComments.GetByTicketId(ticket.Id);

        return new TicketDetails
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Description = ticket.Description,
            Priority = ticket.Priority,
            Status = ticket.Status,
            Customer = customer,
            Agent = agent,
            CreatedAtUtc = ticket.CreatedAtUtc,
            SlaDueAtUtc = ticket.SlaDueAtUtc,
            ResolvedAtUtc = ticket.ResolvedAtUtc,
            Comments = comments
        };
    }

    private static int GetSlaHours(TicketPriority priority)
    {
        return priority switch
        {
            TicketPriority.Urgent => 4,
            TicketPriority.High => 12,
            TicketPriority.Medium => 24,
            _ => 48
        };
    }
}
