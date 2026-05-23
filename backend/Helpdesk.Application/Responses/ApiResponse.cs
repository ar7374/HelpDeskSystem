namespace Helpdesk.Application.Responses;

public class ApiResponse<T>
{
    public int StatusCode { get; set; }
    public bool Status { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> Success(string message, T data)
    {
        return new ApiResponse<T>
        {
            StatusCode = 200,
            Status = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Created(string message, T data)
    {
        return new ApiResponse<T>
        {
            StatusCode = 201,
            Status = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> BadRequest(string message)
    {
        return Error(400, message);
    }

    public static ApiResponse<T> NotFound(string message)
    {
        return Error(404, message);
    }

    private static ApiResponse<T> Error(int statusCode, string message)
    {
        return new ApiResponse<T>
        {
            StatusCode = statusCode,
            Status = false,
            Message = message,
            Data = default
        };
    }
}
