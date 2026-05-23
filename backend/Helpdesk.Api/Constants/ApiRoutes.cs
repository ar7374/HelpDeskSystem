namespace Helpdesk.Api.Constants;

public static class ApiRoutes
{
    public const string Root = "api";
    public const string Tenants = Root + "/tenants";
    public const string TenantUsers = Tenants + "/{tenantId:guid}/users";
    public const string TenantDashboard = Tenants + "/{tenantId:guid}/dashboard";
    public const string TenantTickets = Tenants + "/{tenantId:guid}/tickets";
    public const string TenantTicketById = TenantTickets + "/{ticketId:guid}";
    public const string Tickets = Root + "/tickets";
    public const string TicketComments = TenantTicketById + "/comments";
}
