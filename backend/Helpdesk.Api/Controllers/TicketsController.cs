using Helpdesk.Api.Constants;
using Helpdesk.Application.Requests;
using Helpdesk.Application.Services;
using Helpdesk.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
public sealed class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketsController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet(ApiRoutes.TenantTickets)]
    public IActionResult GetTickets(
        Guid tenantId,
        [FromQuery] TicketFilterRequest request)
    {
        request.TenantId = tenantId;

        var response = _ticketService.GetTickets(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet(ApiRoutes.TenantTicketById)]
    public IActionResult GetTicket([FromRoute] TicketRouteRequest request)
    {
        var response = _ticketService.GetTicket(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost(ApiRoutes.Tickets)]
    public IActionResult CreateTicket(CreateTicketRequest request)
    {
        var response = _ticketService.CreateTicket(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut(ApiRoutes.TenantTicketById)]
    public IActionResult UpdateTicket([FromRoute] TicketRouteRequest route, UpdateTicketRequest request)
    {
        var command = new UpdateTicketCommand
        {
            Route = route,
            Request = request
        };

        var response = _ticketService.UpdateTicket(command);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost(ApiRoutes.TicketComments)]
    public IActionResult AddComment([FromRoute] TicketRouteRequest route, AddCommentRequest request)
    {
        var command = new AddCommentCommand
        {
            Route = route,
            Request = request
        };

        var response = _ticketService.AddComment(command);
        return StatusCode(response.StatusCode, response);
    }
}
