using Helpdesk.Api.Context;
using Helpdesk.Api.Hubs;
using Helpdesk.Api.Jobs;
using Helpdesk.Api.Middleware;
using Helpdesk.Api.Services;
using Helpdesk.Application.Common;
using Helpdesk.Application.Repositories;
using Helpdesk.Application.Services;
using Helpdesk.Infrastructure.Persistence;
using Helpdesk.Infrastructure.Persistence.Repositories;
using Helpdesk.Infrastructure.Persistence.Seed;
using Helpdesk.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Quartz;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});
builder.Services.AddOpenApi();
builder.Services.AddDbContext<HelpdeskDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis Distributed Cache Configuration
builder.Services.AddStackExchangeRedisCache(options =>
{
    var redisConn = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    options.ConfigurationOptions = StackExchange.Redis.ConfigurationOptions.Parse(redisConn);
    options.ConfigurationOptions.AbortOnConnectFail = false;
    options.ConfigurationOptions.ConnectTimeout = 5000;
    options.ConfigurationOptions.SyncTimeout = 5000;
});

// JWT Configuration
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HelpdeskAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HelpdeskUI";

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddSignalR();
builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantRepository, EfTenantRepository>();
builder.Services.AddScoped<IUserRepository, EfUserRepository>();
builder.Services.AddScoped<ITicketRepository, EfTicketRepository>();
builder.Services.AddScoped<ITicketCommentRepository, EfTicketCommentRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped<TenantService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuditService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ISignalRNotificationService,SignalRNotificationService>();
 builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHashService, PasswordHashService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAuditLogRepository, EfAuditLogRepository>();
builder.Services.AddScoped<DatabaseSeeder>();

builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey(nameof(SlaCheckJob));
    q.AddJob<SlaCheckJob>(opts => opts.WithIdentity(jobKey));

    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity($"{nameof(SlaCheckJob)}-trigger")
        .WithSimpleSchedule(x => x
            .WithIntervalInHours(24) // Run once every 24 hours
            .RepeatForever())
        .StartNow());

});

// Add Quartz Hosting Service
builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    seeder.Seed();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<DashboardHub>("/hubs/dashboard");
app.MapHub<CommentHub>("/hubs/comments");

app.Run();
