using Helpdesk.Application.Requests;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Responses;

namespace Helpdesk.Application.Services;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        IPasswordHashService passwordHashService,
        IRefreshTokenService refreshTokenService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _passwordHashService = passwordHashService;
        _refreshTokenService = refreshTokenService;
        _unitOfWork = unitOfWork;
    }

    public ApiResponse<LoginResponse> Login(LoginRequest request)
    {
        if (request.TenantId == Guid.Empty || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 400,
                Message = "Tenant ID, email and password are required",
                Status = false
            };
        }

        var user = _userRepository.GetByEmail(request.Email, request.TenantId);

        if (user == null || !_passwordHashService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 401,
                Message = "Invalid email or password",
                Status = false
            };
        }

        var token = _jwtTokenService.GenerateToken(user);
        var refreshToken = _refreshTokenService.GenerateRefreshToken();
        var refreshTokenExpiry = _refreshTokenService.GetRefreshTokenExpiry();

        // Save refresh token to user
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = refreshTokenExpiry;
        _unitOfWork.Users.Update(user);

        return new ApiResponse<LoginResponse>
        {
            StatusCode = 200,
            Message = "Login successful",
            Status = true,
            Data = new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                User = new UserAuthInfo
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    TenantId = user.TenantId
                }
            }
        };
    }

    public ApiResponse<RefreshTokenResponse> RefreshToken(RefreshTokenRequest request)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
        {
            return new ApiResponse<RefreshTokenResponse>
            {
                StatusCode = 400,
                Message = "Refresh token is required",
                Status = false
            };
        }

        var user = _userRepository.GetByRefreshToken(request.RefreshToken);

        if (user == null)
        {
            return new ApiResponse<RefreshTokenResponse>
            {
                StatusCode = 401,
                Message = "Invalid refresh token",
                Status = false
            };
        }

        if (user.RefreshTokenExpiryTime < DateTime.UtcNow)
        {
            return new ApiResponse<RefreshTokenResponse>
            {
                StatusCode = 401,
                Message = "Refresh token has expired",
                Status = false
            };
        }

        var token = _jwtTokenService.GenerateToken(user);
        var newRefreshToken = _refreshTokenService.GenerateRefreshToken();
        var refreshTokenExpiry = _refreshTokenService.GetRefreshTokenExpiry();

        // Update refresh token
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = refreshTokenExpiry;
        _unitOfWork.Users.Update(user);

        return new ApiResponse<RefreshTokenResponse>
        {
            StatusCode = 200,
            Message = "Token refreshed successfully",
            Status = true,
            Data = new RefreshTokenResponse
            {
                Token = token,
                RefreshToken = newRefreshToken
            }
        };
    }
}
