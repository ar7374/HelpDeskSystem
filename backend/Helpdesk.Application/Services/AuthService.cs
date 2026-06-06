using Helpdesk.Application.Requests;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Responses;
using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace Helpdesk.Application.Services;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        IPasswordHashService passwordHashService,
        IRefreshTokenService refreshTokenService,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _passwordHashService = passwordHashService;
        _refreshTokenService = refreshTokenService;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<ApiResponse<LoginResponse>> Login(LoginRequest request)
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

        var tenant = await _unitOfWork.Tenants.GetById(request.TenantId);
        if (tenant == null)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 404,
                Message = "Workspace not found",
                Status = false
            };
        }

        if (tenant.Status != Helpdesk.Domain.Enums.TenantStatus.Approved)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 403,
                Message = tenant.Status == Helpdesk.Domain.Enums.TenantStatus.Pending
                    ? "Your company registration is currently pending approval. Please contact support."
                    : "Your company registration has been rejected. Access denied.",
                Status = false
            };
        }

        var user = await _userRepository.GetByEmail(request.Email, request.TenantId);

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
        await _unitOfWork.Users.Update(user);

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

    public async Task<ApiResponse<RefreshTokenResponse>> RefreshToken(RefreshTokenRequest request)
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

        var user = await _userRepository.GetByRefreshToken(request.RefreshToken);

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
        await _unitOfWork.Users.Update(user);

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

    public async Task<ApiResponse<Tenant>> GetTenantBySlug(string slug)
    {
        if (string.IsNullOrEmpty(slug))
        {
            return new ApiResponse<Tenant>
            {
                StatusCode = 400,
                Message = "Tenant slug is required",
                Status = false
            };
        }

        var tenant = await _unitOfWork.Tenants.GetBySlug(slug);
        if (tenant == null)
        {
            return new ApiResponse<Tenant>
            {
                StatusCode = 404,
                Message = "Tenant not found",
                Status = false
            };
        }

        return ApiResponse<Tenant>.Success("Tenant resolved successfully", tenant);
    }

    public async Task<ApiResponse<LoginResponse>> GoogleLogin(GoogleLoginRequest request)
    {
        if (request.TenantId == Guid.Empty || string.IsNullOrEmpty(request.CredentialToken))
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 400,
                Message = "Tenant ID and Google ID token are required",
                Status = false
            };
        }

        var googleClientId = _configuration["GoogleAuth:ClientId"];
        if (string.IsNullOrWhiteSpace(googleClientId))
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 500,
                Message = "Google authentication is not configured.",
                Status = false
            };
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                request.CredentialToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { googleClientId }
                });
        }
        catch (InvalidJwtException)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 401,
                Message = "Invalid Google ID token.",
                Status = false
            };
        }
        catch (Exception)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 503,
                Message = "Google token verification failed. Please try again.",
                Status = false
            };
        }

        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 400,
                Message = "Google ID token does not include an email address.",
                Status = false
            };
        }

        if (payload.EmailVerified != true)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 403,
                Message = "Google account email is not verified.",
                Status = false
            };
        }

        var email = payload.Email.Trim().ToLower();

        var tenant = await _unitOfWork.Tenants.GetById(request.TenantId);
        if (tenant == null)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 404,
                Message = "Workspace not found",
                Status = false
            };
        }

        if (tenant.Status != Helpdesk.Domain.Enums.TenantStatus.Approved)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 403,
                Message = tenant.Status == Helpdesk.Domain.Enums.TenantStatus.Pending
                    ? "Your company registration is currently pending approval. Please contact support."
                    : "Your company registration has been rejected. Access denied.",
                Status = false
            };
        }

        // 1. Verify that the pre-registered user account exists in the specific corporate tenant boundary!
        var user = await _userRepository.GetByEmail(email, request.TenantId);

        if (user == null)
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 404,
                Message = $"No active account found for '{email}' in this company. Please contact your company administrator to register your corporate account.",
                Status = false
            };
        }

        // 2. Account verified! Issue standard JWT & refresh token set
        var token = _jwtTokenService.GenerateToken(user);
        var refreshToken = _refreshTokenService.GenerateRefreshToken();
        var refreshTokenExpiry = _refreshTokenService.GetRefreshTokenExpiry();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = refreshTokenExpiry;
        await _unitOfWork.Users.Update(user);

        return new ApiResponse<LoginResponse>
        {
            StatusCode = 200,
            Message = "Google sign-in successful",
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

    public async Task<ApiResponse<string>> RegisterTenant(RegisterTenantRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName) || 
            string.IsNullOrWhiteSpace(request.CompanySlug) || 
            string.IsNullOrWhiteSpace(request.FounderName) || 
            string.IsNullOrWhiteSpace(request.FounderEmail) || 
            string.IsNullOrWhiteSpace(request.FounderPassword))
        {
            return new ApiResponse<string>
            {
                StatusCode = 400,
                Message = "All fields are required.",
                Status = false
            };
        }

        var slug = request.CompanySlug.Trim().ToLower();
        var existingTenant = await _unitOfWork.Tenants.GetBySlug(slug);
        if (existingTenant != null)
        {
            return new ApiResponse<string>
            {
                StatusCode = 400,
                Message = "A company with this workspace slug already exists.",
                Status = false
            };
        }

        var tenantId = Guid.NewGuid();
        var newTenant = new Tenant
        {
            Id = tenantId,
            Name = request.CompanyName.Trim(),
            Slug = slug,
            Status = TenantStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };
        await _unitOfWork.Tenants.Add(newTenant);

        var founder = new User
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            FullName = request.FounderName.Trim(),
            Email = request.FounderEmail.Trim().ToLower(),
            PasswordHash = _passwordHashService.HashPassword(request.FounderPassword),
            Role = UserRole.Admin,
            CreatedAtUtc = DateTime.UtcNow
        };
        await _unitOfWork.Users.Add(founder);

        return ApiResponse<string>.Success(
            "Company registration submitted successfully! Your account will be active once approved by the Super Administrator.",
            slug
        );
    }
}
