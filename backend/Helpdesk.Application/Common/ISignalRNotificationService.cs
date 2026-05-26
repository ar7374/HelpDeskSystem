namespace Helpdesk.Application.Common;

public interface ISignalRNotificationService
{
    Task NotifyTicketCreated(Guid tenantId, object data);

    Task NotifyTicketUpdated(Guid tenantId, object data);

    Task NotifyCommentAdded(Guid tenantId, Guid ticketId, object data);
}