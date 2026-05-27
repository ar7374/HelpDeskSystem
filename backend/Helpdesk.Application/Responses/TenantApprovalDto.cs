namespace Helpdesk.Application.Responses;

public class TenantApprovalDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public string FounderName { get; set; } = string.Empty;
    public string FounderEmail { get; set; } = string.Empty;
}
