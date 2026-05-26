using System.Security.Cryptography;

namespace Helpdesk.Application.Services;

public interface IRefreshTokenService
{
    string GenerateRefreshToken();
    DateTime GetRefreshTokenExpiry(int days = 7);
}

public class RefreshTokenService : IRefreshTokenService
{
    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }
        return Convert.ToBase64String(randomNumber);
    }

    public DateTime GetRefreshTokenExpiry(int days = 7)
    {
        return DateTime.UtcNow.AddDays(days);
    }
}
