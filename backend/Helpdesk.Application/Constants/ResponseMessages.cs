namespace Helpdesk.Application.Constants;

public static class ResponseMessages
{
    public static class Success
    {
        public const string TenantsFetched = "Tenants fetched successfully.";
        public const string UsersFetched = "Users fetched successfully.";
        public const string DashboardFetched = "Dashboard fetched successfully.";
        public const string TicketsFetched = "Tickets fetched successfully.";
        public const string TicketFetched = "Ticket fetched successfully.";
        public const string TicketCreated = "Ticket created successfully.";
        public const string TicketUpdated = "Ticket updated successfully.";
        public const string CommentAdded = "Comment added successfully.";
    }

    public static class Error
    {
        public const string TicketNotFound = "Ticket not found.";
        public const string TicketAccessDenied = "You are not allowed to access this ticket.";
        public const string TenantAccessDenied = "You are not allowed to access this workspace.";
        public const string TicketUpdateDenied = "You are not allowed to update this ticket.";
        public const string TicketAssignmentDenied = "Only administrators can change ticket assignment.";
        public const string InvalidTicketCustomer = "Ticket customer must belong to this workspace.";
        public const string InvalidTicketAgent = "Ticket agent must belong to this workspace and have an agent/admin role.";
        public const string TitleAndDescriptionRequired = "Title and description are required.";
        public const string CommentBodyRequired = "Comment body is required.";
    }
}
