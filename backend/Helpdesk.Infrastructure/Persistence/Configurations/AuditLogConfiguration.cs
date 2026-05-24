using Helpdesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Helpdesk.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(log => log.Id);

        builder.Property(log => log.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(log => log.EntityType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(log => log.Description)
            .HasMaxLength(1000)
            .IsRequired();

        builder.HasIndex(log => log.TenantId);

        builder.HasIndex(log => log.CreatedAtUtc);
    }
}