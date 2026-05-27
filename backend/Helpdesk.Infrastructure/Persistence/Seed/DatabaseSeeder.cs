using Helpdesk.Application.Services;
using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Infrastructure.Persistence.Seed;

public class DatabaseSeeder
{
    private readonly HelpdeskDbContext _dbContext;
    private readonly IPasswordHashService _passwordHashService;

    public DatabaseSeeder(HelpdeskDbContext dbContext, IPasswordHashService passwordHashService)
    {
        _dbContext = dbContext;
        _passwordHashService = passwordHashService;
    }

    public void Seed()
    {
        _dbContext.Database.Migrate();

        if (_dbContext.Tenants.Any())
        {
            return;
        }

        var tenantId = Guid.Parse("2f39f1f7-8895-4ad2-95f7-8f70e5f02571");
        var adminId = Guid.Parse("b19f7d89-51f8-42fc-a75e-9966cbca25ef");
        var agentId = Guid.Parse("e965cda4-3cc5-42c5-95ea-75199be881c4");
        var customerId = Guid.Parse("52a437d8-7304-4f60-aae4-2136b51ea69d");
        var secondCustomerId = Guid.Parse("0783ff7a-555c-4707-93e5-4c6f247f6521");
        var firstTicketId = Guid.Parse("9ed18848-59a7-4c40-a4a2-b7b542e52c5e");
        var secondTicketId = Guid.Parse("eb33c753-f08a-45de-9542-f4193dbb198a");
        var now = DateTime.UtcNow;

        var superTenantId = Guid.Parse("9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c");
        var superAdminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        _dbContext.Tenants.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Cloud Support",
            Slug = "acme-cloud",
            Status = TenantStatus.Approved,
            CreatedAtUtc = now.AddDays(-60)
        });

        _dbContext.Tenants.Add(new Tenant
        {
            Id = superTenantId,
            Name = "Super System Admin",
            Slug = "super-admin",
            Status = TenantStatus.Approved,
            CreatedAtUtc = now.AddDays(-100)
        });

        _dbContext.Users.AddRange(
        [
            new User { Id = superAdminUserId, TenantId = superTenantId, FullName = "Super Admin", Email = "super@support.test", PasswordHash = _passwordHashService.HashPassword("Super@123"), Role = UserRole.SuperAdmin, CreatedAtUtc = now.AddDays(-100) },
            new User { Id = adminId, TenantId = tenantId, FullName = "Nisha Admin", Email = "nisha@acme.test", PasswordHash = _passwordHashService.HashPassword("Admin@123"), Role = UserRole.Admin, CreatedAtUtc = now.AddDays(-45) },
            new User { Id = agentId, TenantId = tenantId, FullName = "Rahul Agent", Email = "rahul@acme.test", PasswordHash = _passwordHashService.HashPassword("Agent@123"), Role = UserRole.Agent, CreatedAtUtc = now.AddDays(-42) },
            new User { Id = customerId, TenantId = tenantId, FullName = "Priya Customer", Email = "priya@client.test", PasswordHash = _passwordHashService.HashPassword("Customer@123"), Role = UserRole.Customer, CreatedAtUtc = now.AddDays(-30) },
            new User { Id = secondCustomerId, TenantId = tenantId, FullName = "Arjun Customer", Email = "arjun@client.test", PasswordHash = _passwordHashService.HashPassword("Customer@123"), Role = UserRole.Customer, CreatedAtUtc = now.AddDays(-25) }
        ]);

        _dbContext.Tickets.AddRange(
        [
            new Ticket { Id = firstTicketId, TenantId = tenantId, TicketNumber = "HD-1001", Title = "Login OTP not received", Description = "Customer cannot receive login OTP on registered email.", Priority = TicketPriority.High, Status = TicketStatus.Open, CustomerId = customerId, AgentId = agentId, CreatedAtUtc = now.AddHours(-9), SlaDueAtUtc = now.AddHours(3) },
            new Ticket { Id = secondTicketId, TenantId = tenantId, TicketNumber = "HD-1002", Title = "Billing invoice mismatch", Description = "Invoice amount differs from the selected plan.", Priority = TicketPriority.Medium, Status = TicketStatus.InProgress, CustomerId = secondCustomerId, AgentId = agentId, CreatedAtUtc = now.AddHours(-18), SlaDueAtUtc = now.AddHours(6) },
            new Ticket { Id = Guid.Parse("05fb8715-050f-4df2-b4aa-c98911191230"), TenantId = tenantId, TicketNumber = "HD-1003", Title = "Export report failed", Description = "CSV export fails for monthly ticket report.", Priority = TicketPriority.Urgent, Status = TicketStatus.Resolved, CustomerId = customerId, AgentId = agentId, CreatedAtUtc = now.AddDays(-2), SlaDueAtUtc = now.AddDays(-1).AddHours(8), ResolvedAtUtc = now.AddDays(-1).AddHours(2) },
            new Ticket { Id = Guid.Parse("c140b423-47ca-47a4-a69e-5a6edbd5b08a"), TenantId = tenantId, TicketNumber = "HD-1004", Title = "Password reset page slow", Description = "Password reset flow takes more than 20 seconds.", Priority = TicketPriority.Low, Status = TicketStatus.Closed, CustomerId = secondCustomerId, CreatedAtUtc = now.AddDays(-4), SlaDueAtUtc = now.AddDays(-3), ResolvedAtUtc = now.AddDays(-3).AddHours(-2) }
        ]);

        _dbContext.TicketComments.AddRange(
        [
            new TicketComment { Id = Guid.NewGuid(), TicketId = firstTicketId, AuthorId = customerId, Body = "We tried twice and did not receive the email.", CreatedAtUtc = now.AddHours(-8) },
            new TicketComment { Id = Guid.NewGuid(), TicketId = firstTicketId, AuthorId = agentId, Body = "Checking mail provider logs and resend queue.", CreatedAtUtc = now.AddHours(-6) },
            new TicketComment { Id = Guid.NewGuid(), TicketId = secondTicketId, AuthorId = agentId, Body = "Invoice recalculation job is being reviewed.", CreatedAtUtc = now.AddHours(-12) }
        ]);

        _dbContext.SaveChanges();
    }
}
