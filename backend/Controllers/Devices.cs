using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using Dtos;

[ApiController]
[Route("devices")]
[Produces("application/json")]
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public DevicesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DeviceRegisterDTO dto)
    {
        if (dto is null)
            return BadRequest(new { error = "Body is required." });
        if (string.IsNullOrWhiteSpace(dto.Id))
            return BadRequest(new { error = "Device ID is required." });
        if (dto.UserId == Guid.Empty)
            return BadRequest(new { error = "UserId is required." });

        var existing = await _db.Devices.FirstOrDefaultAsync(d => d.Id == dto.Id);
        if (existing != null)
            return Conflict(new { error = "Device already registered." });

        var entity = new Devices
        {
            Id = dto.Id,
            Name = dto.Name ?? "Unnamed Device",
            Location = dto.Location,
            Registered_at = DateTime.UtcNow,
            User_Id = dto.UserId
        };

        _db.Devices.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Device '{entity.Id}' registered.",
            data = DeviceOutDTO.FromEntity(entity)
        });
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        var devices = await _db.Devices
            .Where(d => d.User_Id == userId)
            .OrderByDescending(d => d.Registered_at)
            .ToListAsync();

        return Ok(devices.Select(DeviceOutDTO.FromEntity));
    }


    [HttpGet("{deviceId}")]
    public async Task<IActionResult> GetOne(string deviceId)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == deviceId);
        if (device == null)
            return NotFound(new { error = "Device not found." });

        return Ok(DeviceOutDTO.FromEntity(device));
    }
}
