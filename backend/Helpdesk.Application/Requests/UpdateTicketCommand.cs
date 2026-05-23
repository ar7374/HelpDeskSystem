namespace Helpdesk.Application.Requests;

public class UpdateTicketCommand
{
    public TicketRouteRequest Route { get; set; } = new();
    public UpdateTicketRequest Request { get; set; } = new();
}
