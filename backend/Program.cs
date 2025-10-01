using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

Console.OutputEncoding = Encoding.UTF8;

var builder = WebApplication.CreateBuilder(args);

var connectionString = DbConnectionService.TestDatabaseConnection();

// EF Core + PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Connect Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Portfolio API", Version = "v1" });
});

builder.Services.AddControllers();
builder.Services.AddHealthChecks();

// CORS
var frontendOrigin = Environment.GetEnvironmentVariable("ALLOWED_FRONTEND_PORT") ?? "https://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy.WithOrigins(frontendOrigin)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();



// Connect Swagger UI in Development
if (app.Environment.IsDevelopment())
{
    app.UseMiddleware<SwaggerAuth>();
    app.UseSwagger();
    app.UseSwaggerUI();
} // for swagger acces: $env:ASPNETCORE_ENVIRONMENT = "Development"


// CORS
if (app.Environment.IsDevelopment())
{
    app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
}
else
{
    app.UseCors("FrontendOnly");
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.UseStaticFiles();
app.MapHealthChecks("/health");
app.MapControllers();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

app.Run($"http://0.0.0.0:{port}");
