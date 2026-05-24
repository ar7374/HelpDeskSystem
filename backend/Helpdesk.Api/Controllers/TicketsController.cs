using Helpdesk.Api.Constants;
using Helpdesk.Application.Requests;
using Helpdesk.Application.Services;
using Helpdesk.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Authorize]
public sealed class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketsController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpPost(ApiRoutes.TenantTickets)]
    [Authorize(Roles = RoleConstants.AllRoles)]
    public IActionResult GetTickets(
        Guid tenantId,
        [FromBody] SearchRequest<TicketSearchCriteria> request)
    {
        var response = _ticketService.GetTicketsPaginated(request, tenantId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet(ApiRoutes.TenantTicketById)]
    [Authorize(Roles = RoleConstants.AllRoles)]
    public IActionResult GetTicket([FromRoute] TicketRouteRequest request)
    {
        var response = _ticketService.GetTicket(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost(ApiRoutes.Tickets)]
    [Authorize(Roles = RoleConstants.AdminAndCustomer)]
    public IActionResult CreateTicket(CreateTicketRequest request)
    {
        var response = _ticketService.CreateTicket(request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut(ApiRoutes.TenantTicketById)]
    [Authorize(Roles = RoleConstants.AdminAndAgent)]
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
    [Authorize(Roles = RoleConstants.AllRoles)]
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
