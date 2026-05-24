# JWT Authentication Implementation Guide

## Overview
JWT (JSON Web Token) authentication has been successfully implemented for your Helpdesk SaaS application. All endpoints are now protected with JWT authentication.

## Test Credentials

You can use these credentials to login and obtain JWT tokens:

### Admin User
- Email: `nisha@acme.test`
- Password: `Admin@123`
- Role: Admin

### Agent User
- Email: `rahul@acme.test`
- Password: `Agent@123`
- Role: Agent

### Customer Users
- Email: `priya@client.test`
- Password: `Customer@123`
- Role: Customer

- Email: `arjun@client.test`
- Password: `Customer@123`
- Role: Customer

## Login Endpoint

**URL:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "nisha@acme.test",
  "password": "Admin@123"
}
```

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "b19f7d89-51f8-42fc-a75e-9966cbca25ef",
      "fullName": "Nisha Admin",
      "email": "nisha@acme.test",
      "role": "Admin",
      "tenantId": "2f39f1f7-8895-4ad2-95f7-8f70e5f02571"
    }
  }
}
```

**Response (Failure - 401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "success": false,
  "data": null
}
```

## Using the JWT Token

Include the token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Implementation Details

### Files Created/Modified:

1. **NuGet Packages Added** (`Helpdesk.Api.csproj`):
   - Microsoft.AspNetCore.Authentication.JwtBearer v9.0.9
   - System.IdentityModel.Tokens.Jwt v7.7.0

2. **New Services Created**:
   - `JwtTokenService.cs` - Generates JWT tokens
   - `PasswordHashService.cs` - Hashes and verifies passwords (SHA256)
   - `AuthService.cs` - Handles login logic

3. **New DTOs Created**:
   - `LoginRequest.cs` - Login request DTO
   - `LoginResponse.cs` - Login response DTO with token and user info

4. **New Controllers Created**:
   - `AuthController.cs` - Provides `/api/auth/login` endpoint

5. **Updated Files**:
   - `User.cs` - Added `PasswordHash` property
   - `IUserRepository.cs` - Added `GetByEmail()` method
   - `EfUserRepository.cs` - Implemented `GetByEmail()` method
   - `Program.cs` - Added JWT authentication middleware and service registration
   - `appsettings.json` - Added JWT configuration
   - `DatabaseSeeder.cs` - Added password hashes for test users
   - All Controllers - Added `[Authorize]` attributes to protect endpoints

### JWT Configuration (appsettings.json)

```json
"Jwt": {
  "Secret": "your-super-secret-key-min-32-characters-long-!!!",
  "Issuer": "HelpdeskAPI",
  "Audience": "HelpdeskUI",
  "ExpirationMinutes": 1440
}
```

**⚠️ IMPORTANT:** Change the `Secret` value to a strong, random key in production!

### Token Claims

Each JWT token includes the following claims:
- `NameIdentifier` - User ID
- `Email` - User email
- `Name` - User full name
- `TenantId` - Tenant ID
- `Role` - User role (Admin, Agent, Customer)

### Protected Endpoints

All of the following endpoints now require JWT authentication:

- `GET /api/users?tenantId=...` - Get users by tenant
- `GET /api/tenants` - Get tenants
- `GET /api/tickets?tenantId=...` - Get tickets
- `GET /api/tickets/{tenantId}/{ticketId}` - Get ticket details
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/{tenantId}/{ticketId}` - Update ticket
- `GET /api/dashboard?tenantId=...` - Get dashboard

### Token Expiration

Tokens expire after **1440 minutes (24 hours)** by default. Users must login again to get a new token.

## Frontend Integration

In your frontend (React/Vue), store the token after login and include it in all API requests:

```javascript
// After login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
localStorage.setItem('authToken', data.token);

// For subsequent requests
fetch('/api/tickets?tenantId=...', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
```

## Security Notes

1. **Secret Key**: Always use a strong, random secret key in production
2. **HTTPS**: Always use HTTPS in production to prevent token interception
3. **Token Storage**: Consider secure token storage strategies on the client side
4. **Password Hashing**: Currently using SHA256. Consider upgrading to bcrypt or Argon2 for production
5. **CORS**: Update CORS policy to include your frontend domain in production

## Next Steps

1. Update the JWT secret in `appsettings.json` for production
2. Implement token refresh mechanism if needed
3. Add role-based authorization policies
4. Consider implementing password reset functionality
5. Add email verification for new users
6. Update frontend to implement login UI and token management
