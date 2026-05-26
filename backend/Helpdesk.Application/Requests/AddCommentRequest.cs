namespace Helpdesk.Application.Requests;

public class AddCommentRequest
{
    public Guid AuthorId { get; set; }
    public string Body { get; set; } = string.Empty;
}
