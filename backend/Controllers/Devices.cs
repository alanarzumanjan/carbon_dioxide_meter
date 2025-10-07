using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Models;
using Dtos;

namespace Controllers;

[ApiController]
[Route("/devices")]
[Produces("application/json")]
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public DevicesController(AppDbContext db)
    {
        _db = db;
    }

    // POST /devices/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DeviceRegisterDTO request)
    {
        if (request is null)
            return BadRequest(new { error = "Body is required." });

        if (string.IsNullOrWhiteSpace(request.Id))
            return BadRequest(new { error = "Device ID is required." });

        if (request.UserId == Guid.Empty)
            return BadRequest(new { error = "UserId is required." });

        try
        {
            if (await _db.Devices.AnyAsync(d => d.Id == request.Id))
                return Conflict(new { error = "Device ID already registered." });

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                bool nameExists = await _db.Devices.AnyAsync(d =>
                    d.User_Id == request.UserId && d.Name!.ToLower() == request.Name.ToLower());
                if (nameExists)
                    return Conflict(new { error = "Device with this name already exists for this user." });
            }

            if (!string.IsNullOrWhiteSpace(request.Location))
            {
                bool locationExists = await _db.Devices.AnyAsync(d =>
                    d.User_Id == request.UserId && d.Location!.ToLower() == request.Location.ToLower());
                if (locationExists)
                    return Conflict(new { error = "Device with this location already exists for this user." });
            }

            var device = new Devices
            {
                Id = request.Id,
                Name = request.Name ?? "Unnamed Device",
                Location = request.Location,
                Registered_at = DateTime.UtcNow,
                User_Id = request.UserId
            };

            using var transaction = await _db.Database.BeginTransactionAsync();
            _db.Devices.Add(device);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var message = $"> Device '{device.Id}' registered for user {device.User_Id}";
            Console.WriteLine(message);
            return Ok(new { message, data = DeviceOutDTO.FromEntity(device) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to register device: {ex.Message}");
            return StatusCode(500, "Failed to register device.");
        }
    }

    // GET /devices/{userId}
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        try
        {
            var devices = await _db.Devices
                .Where(d => d.User_Id == userId)
                .OrderByDescending(d => d.Registered_at)
                .ToListAsync();

            var message = $"> Fetched {devices.Count} devices for user {userId}";
            Console.WriteLine(message);

            return Ok(new { message, data = devices.Select(DeviceOutDTO.FromEntity) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to get devices: {ex.Message}");
            return StatusCode(500, "Failed to get devices.");
        }
    }

    // GET /devices/{deviceId}
    [HttpGet("{deviceId}")]
    public async Task<IActionResult> GetOne(string deviceId)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "DeviceId is required." });

        try
        {
            var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == deviceId);
            if (device is null)
                return NotFound(new { error = "Device not found." });

            var message = $"> Device '{device.Id}' fetched.";
            Console.WriteLine(message);
            return Ok(new { message, data = DeviceOutDTO.FromEntity(device) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to fetch device: {ex.Message}");
            return StatusCode(500, "Failed to fetch device.");
        }
    }
}
