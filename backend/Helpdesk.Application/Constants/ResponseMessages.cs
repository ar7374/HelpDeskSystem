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
        public const string TitleAndDescriptionRequired = "Title and description are required.";
        public const string CommentBodyRequired = "Comment body is required.";
    }
}
