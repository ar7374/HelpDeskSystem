using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;

namespace Helpdesk.Infrastructure.Data;

public sealed class InMemoryHelpdeskDataStore
{
    public List<Tenant> Tenants { get; } = [];
    public List<User> Users { get; } = [];
    public List<Ticket> Tickets { get; } = [];
    public List<TicketComment> Comments { get; } = [];

    public InMemoryHelpdeskDataStore()
    {
        var tenantId = Guid.Parse("2f39f1f7-8895-4ad2-95f7-8f70e5f02571");
        var adminId = Guid.Parse("b19f7d89-51f8-42fc-a75e-9966cbca25ef");
        var agentId = Guid.Parse("e965cda4-3cc5-42c5-95ea-75199be881c4");
        var customerId = Guid.Parse("52a437d8-7304-4f60-aae4-2136b51ea69d");
        var secondCustomerId = Guid.Parse("0783ff7a-555c-4707-93e5-4c6f247f6521");
        var now = DateTime.UtcNow;

        Tenants.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Cloud Support",
            Slug = "acme-cloud",
            CreatedAtUtc = now.AddDays(-60)
        });

        Users.AddRange(
        [
            CreateUser(adminId, tenantId, "Nisha Admin", "nisha@acme.test", UserRole.Admin, now.AddDays(-45)),
            CreateUser(agentId, tenantId, "Rahul Agent", "rahul@acme.test", UserRole.Agent, now.AddDays(-42)),
            CreateUser(customerId, tenantId, "Priya Customer", "priya@client.test", UserRole.Customer, now.AddDays(-30)),
            CreateUser(secondCustomerId, tenantId, "Arjun Customer", "arjun@client.test", UserRole.Customer, now.AddDays(-25))
        ]);

        Tickets.AddRange(
        [
            CreateTicket(tenantId, "HD-1001", "Login OTP not received", "Customer cannot receive login OTP on registered email.", TicketPriority.High, TicketStatus.Open, customerId, agentId, now.AddHours(-9), now.AddHours(3), null),
            CreateTicket(tenantId, "HD-1002", "Billing invoice mismatch", "Invoice amount differs from the selected plan.", TicketPriority.Medium, TicketStatus.InProgress, secondCustomerId, agentId, now.AddHours(-18), now.AddHours(6), null),
            CreateTicket(tenantId, "HD-1003", "Export report failed", "CSV export fails for monthly ticket report.", TicketPriority.Urgent, TicketStatus.Resolved, customerId, agentId, now.AddDays(-2), now.AddDays(-1).AddHours(8), now.AddDays(-1).AddHours(2)),
            CreateTicket(tenantId, "HD-1004", "Password reset page slow", "Password reset flow takes more than 20 seconds.", TicketPriority.Low, TicketStatus.Closed, secondCustomerId, null, now.AddDays(-4), now.AddDays(-3), now.AddDays(-3).AddHours(-2))
        ]);

        Comments.AddRange(
        [
            CreateComment(Tickets[0].Id, customerId, "We tried twice and did not receive the email.", now.AddHours(-8)),
            CreateComment(Tickets[0].Id, agentId, "Checking mail provider logs and resend queue.", now.AddHours(-6)),
            CreateComment(Tickets[1].Id, agentId, "Invoice recalculation job is being reviewed.", now.AddHours(-12))
        ]);
    }

    private static User CreateUser(Guid id, Guid tenantId, string fullName, string email, UserRole role, DateTime createdAtUtc)
    {
        return new User
        {
            Id = id,
            TenantId = tenantId,
            FullName = fullName,
            Email = email,
            Role = role,
            CreatedAtUtc = createdAtUtc
        };
    }

    private static Ticket CreateTicket(
        Guid tenantId,
        string ticketNumber,
        string title,
        string description,
        TicketPriority priority,
        TicketStatus status,
        Guid customerId,
        Guid? agentId,
        DateTime createdAtUtc,
        DateTime slaDueAtUtc,
        DateTime? resolvedAtUtc)
    {
        return new Ticket
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TicketNumber = ticketNumber,
            Title = title,
            Description = description,
            Priority = priority,
            Status = status,
            CustomerId = customerId,
            AgentId = agentId,
            CreatedAtUtc = createdAtUtc,
            SlaDueAtUtc = slaDueAtUtc,
            ResolvedAtUtc = resolvedAtUtc
        };
    }

    private static TicketComment CreateComment(Guid ticketId, Guid authorId, string body, DateTime createdAtUtc)
    {
        return new TicketComment
        {
            Id = Guid.NewGuid(),
            TicketId = ticketId,
            AuthorId = authorId,
            Body = body,
            CreatedAtUtc = createdAtUtc
        };
    }
}
