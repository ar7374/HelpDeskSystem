namespace Helpdesk.Application.Requests;

public enum SortDirection
{
    Asc,
    Desc
}

public class SearchRequest<T> where T : class
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public SortDirection SortDirection { get; set; } = SortDirection.Desc;
    public T? Criteria { get; set; }
}
