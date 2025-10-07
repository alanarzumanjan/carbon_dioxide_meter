using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Dtos;
using Models;

[ApiController]
[Route("measurements")]
[Produces("application/json")]
public class MeasurementsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly string? _intakeKey;

    public MeasurementsController(AppDbContext db)
    {
        _db = db;
        _intakeKey = Environment.GetEnvironmentVariable("INTAKE_API_KEY");
    }

    private bool IntakeAuthorized(HttpRequest request)
    {
        if (string.IsNullOrWhiteSpace(_intakeKey)) return true;
        if (!request.Headers.TryGetValue("X-Api-Key", out var key)) return false;
        return string.Equals(key.ToString(), _intakeKey, StringComparison.Ordinal);
    }

    [HttpPost]
    public async Task<IActionResult> Ingest([FromBody] MeasurementInDTO dto)
    {
        if (!IntakeAuthorized(Request))
            return Unauthorized(new { error = "Invalid intake key." });

        if (dto is null) return BadRequest(new { error = "Body is required." });
        if (string.IsNullOrWhiteSpace(dto.DeviceId))
            return BadRequest(new { error = "DeviceId is required." });
        if (dto.Co2 <= 0 || dto.Co2 > 100000)
            return BadRequest(new { error = "Co2 value is invalid." });

        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == dto.DeviceId);
        if (device == null)
        {
            device = new Devices
            {
                Id = dto.DeviceId,
                Name = "Auto-registered device",
                CreatedAt = DateTime.UtcNow
            };
            _db.Devices.Add(device);
        }

        var ts = dto.Timestamp?.ToUniversalTime() ?? DateTime.UtcNow;

        var entity = new Measurement
        {
            Id = Guid.NewGuid(),
            Device_Id = dto.DeviceId,
            Co2 = dto.Co2,
            Temperature = dto.Temperature,
            Humidity = dto.Humidity,
            CreatedAt = ts
        };

        _db.Measurements.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Measurement stored.",
            data = MeasurementOutDTO.FromEntity(entity)
        });
    }

    [HttpGet("{deviceId}")]
    public async Task<IActionResult> GetByDevice(string deviceId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "DeviceId is required." });

        limit = Math.Clamp(limit, 1, 1000);
        offset = Math.Max(0, offset);

        var query = _db.Measurements
            .Where(m => m.Device_Id == deviceId)
            .OrderByDescending(m => m.CreatedAt);

        var total = await query.CountAsync();
        var items = await query.Skip(offset).Take(limit).ToListAsync();

        return Ok(new
        {
            total,
            limit,
            offset,
            items = items.Select(MeasurementOutDTO.FromEntity)
        });
    }

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 100)
    {
        limit = Math.Clamp(limit, 1, 1000);

        var items = await _db.Measurements
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return Ok(new
        {
            count = items.Count,
            items = items.Select(MeasurementOutDTO.FromEntity)
        });
    }

    [HttpGet("{deviceId}/latest")]
    public async Task<IActionResult> GetLatest(string deviceId)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "DeviceId is required." });

        var item = await _db.Measurements
            .Where(m => m.Device_Id == deviceId)
            .OrderByDescending(m => m.CreatedAt)
            .FirstOrDefaultAsync();

        if (item == null) return NotFound(new { error = "No measurements yet." });

        return Ok(MeasurementOutDTO.FromEntity(item));
    }
}
