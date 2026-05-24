namespace Helpdesk.Application.Dtos;

public class PaginatedListDto<T>
{
    public IReadOnlyList<T> Data { get; set; } = new List<T>();
    public int Size { get; set; }
    public long TotalRecords { get; set; }
}
