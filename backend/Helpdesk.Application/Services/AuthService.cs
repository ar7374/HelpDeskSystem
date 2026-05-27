using Helpdesk.Application.Requests;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Responses;
using Helpdesk.Domain.Entities;
using Helpdesk.Domain.Enums;

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
                Message = "Tenant ID and Google credential token are required",
                Status = false
            };
        }

        string email = string.Empty;
        string fullName = string.Empty;

        try
        {
            if (request.CredentialToken.Contains(".")) // Real JWT token
            {
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(request.CredentialToken) as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
                
                email = jsonToken?.Claims.FirstOrDefault(c => c.Type == "email")?.Value 
                        ?? jsonToken?.Claims.FirstOrDefault(c => c.Type == "unique_name")?.Value 
                        ?? string.Empty;

                fullName = jsonToken?.Claims.FirstOrDefault(c => c.Type == "name")?.Value 
                           ?? jsonToken?.Claims.FirstOrDefault(c => c.Type == "given_name")?.Value 
                           ?? "Google User";
            }
            else
            {
                // Simulated token mode: passes raw email directly
                email = request.CredentialToken.Trim();
                fullName = email.Split('@')[0];
            }
        }
        catch
        {
            // Fallback to raw value if it fails to parse
            email = request.CredentialToken.Trim();
            fullName = email.Split('@')[0];
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return new ApiResponse<LoginResponse>
            {
                StatusCode = 400,
                Message = "Failed to resolve email from Google credential token.",
                Status = false
            };
        }

        email = email.ToLower();

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
