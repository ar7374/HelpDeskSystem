namespace Helpdesk.Api.Constants;

public static class RoleConstants
{
    public const string Admin = "Admin";
    public const string Agent = "Agent";
    public const string Customer = "Customer";

    public const string AllRoles = $"{Admin},{Agent},{Customer}";
    public const string AdminAndAgent = $"{Admin},{Agent}";
    public const string AdminAndCustomer = $"{Admin},{Customer}";
}
