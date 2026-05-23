namespace Helpdesk.Application.Requests;

public class AddCommentCommand
{
    public TicketRouteRequest Route { get; set; } = new();
    public AddCommentRequest Request { get; set; } = new();
}
