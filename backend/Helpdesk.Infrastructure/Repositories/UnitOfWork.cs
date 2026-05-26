using Helpdesk.Application.Repositories;

namespace Helpdesk.Infrastructure.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    public UnitOfWork(
        ITenantRepository tenants,
        IUserRepository users,
        ITicketRepository tickets,
        ITicketCommentRepository ticketComments,
        IAuditLogRepository auditLogs)
    {
        Tenants = tenants;
        Users = users;
        Tickets = tickets;
        TicketComments = ticketComments;
        AuditLogs = auditLogs;
    }

    public ITenantRepository Tenants { get; }
    public IUserRepository Users { get; }
    public ITicketRepository Tickets { get; }
    public ITicketCommentRepository TicketComments { get; }
    public IAuditLogRepository AuditLogs { get; set; }
}
