using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Models;
using Dtos;
using Validation;
using BCrypt.Net;

namespace Controllers;

[ApiController]
[Route("/")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO request)
    {
        var validator = new UserRegisterValidator();
        var errors = validator.Validate(request);
        if (errors.Count > 0)
            return BadRequest(new { errors });

        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Username != null && u.Username.ToLower() == username.ToLower()))
            return Conflict(new { errors = new { username = "Username already exists." } });

        if (await _db.Users.AnyAsync(u => u.Email != null && u.Email.ToLower() == email))
            return Conflict(new { errors = new { email = "Email already exists." } });

        try
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Email = email,
                Password_hash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            using var transaction = await _db.Database.BeginTransactionAsync();
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var message = $"> User {user.Id}, {user.Username}, {user.Email} is registred";
            Console.WriteLine(message);
            return Ok(new { message, data = user });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to register user: {ex.Message}");
            return StatusCode(500, "Failed to register user.");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO request)
    {
        var validator = new UserLoginValidator();
        var errors = validator.Validate(request);
        if (errors.Count > 0)
            return BadRequest(new { errors });

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email!.ToLower() == email);
        if (user is null)
            return Unauthorized(new { error = "incorrect email." });

        var password = BCrypt.Net.BCrypt.Verify(request.Password, user.Password_hash);
        if (!password)
            return Unauthorized(new { error = "Incorrect password." });

        var message = $"> User {user.Id}, {user.Username}, {user.Email} is logined";
        Console.WriteLine(message);
        return Ok(new { message, data = user });
    }
}