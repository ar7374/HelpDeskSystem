namespace Helpdesk.Application.Repositories;

public interface IUnitOfWork
{
    ITenantRepository Tenants { get; }
    IUserRepository Users { get; }
    ITicketRepository Tickets { get; }
    ITicketCommentRepository TicketComments { get; }
    IAuditLogRepository AuditLogs { get; set; }
}
