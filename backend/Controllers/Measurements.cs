using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using Dtos;

namespace Controllers;

[ApiController]
[Route("/")]
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
        if (string.IsNullOrWhiteSpace(_intakeKey)) return true; // dev mode
        if (!request.Headers.TryGetValue("X-Api-Key", out var key)) return false;
        return string.Equals(key.ToString(), _intakeKey, StringComparison.Ordinal);
    }

    // POST /measurements
    [HttpPost("measurements")]
    [Consumes("application/json")]
    public async Task<IActionResult> Ingest([FromBody] MeasurementInDTO request)
    {
        // auth header
        if (!IntakeAuthorized(Request))
            return Unauthorized(new { error = "Invalid intake key." });

        // simple validation -> { errors = { field = "msg" } }
        var errors = new Dictionary<string, string>();
        if (request is null) return BadRequest(new { error = "Body is required." });
        if (string.IsNullOrWhiteSpace(request.DeviceId)) errors["deviceId"] = "DeviceId is required.";
        if (request.UserId == Guid.Empty) errors["userId"] = "UserId is required.";
        if (request.CO2 <= 0 || request.CO2 > 100000) errors["co2"] = "CO2 value is invalid.";
        if (errors.Count > 0) return BadRequest(new { errors });

        try
        {
            // ensure device exists (auto-register)
            var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == request.DeviceId);
            if (device == null)
            {
                device = new Device
                {
                    Id = request.DeviceId,
                    Name = "Auto-registered device",
                    Location = null,
                    Registered_at = DateTime.UtcNow,
                    User_Id = request.UserId
                };
                _db.Devices.Add(device);
            }

            var ts = (request.Timestamp ?? DateTime.UtcNow).ToUniversalTime();

            var m = new Measurement
            {
                Id = Guid.NewGuid(),
                Device_Id = request.DeviceId,
                User_Id = request.UserId,
                CO2 = request.CO2,
                Temperature = request.Temperature,
                Humidity = request.Humidity,
                Timestamp = ts
            };

            using var tx = await _db.Database.BeginTransactionAsync();
            _db.Measurements.Add(m);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            var message = $"> Measurement stored: device={m.Device_Id}, co2={m.CO2}, ts={m.Timestamp:o}";
            Console.WriteLine(message);
            return Ok(new { message, data = MeasurementOutDTO.FromEntity(m) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to store measurement: {ex.Message}");
            return StatusCode(500, "Failed to store measurement.");
        }
    }

    // GET /measurements/{deviceId}
    [HttpGet("measurements/{deviceId}")]
    public async Task<IActionResult> GetByDevice(string deviceId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { errors = new { deviceId = "DeviceId is required." } });

        try
        {
            limit = Math.Clamp(limit, 1, 1000);
            offset = Math.Max(0, offset);

            var query = _db.Measurements
                .Where(m => m.Device_Id == deviceId)
                .OrderByDescending(m => m.Timestamp);

            var total = await query.CountAsync();
            var items = await query.Skip(offset).Take(limit).ToListAsync();

            var message = $"> Measurements fetched: device={deviceId}, count={items.Count}, total={total}";
            Console.WriteLine(message);

            return Ok(new
            {
                message,
                total,
                limit,
                offset,
                data = items.Select(MeasurementOutDTO.FromEntity)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to get measurements: {ex.Message}");
            return StatusCode(500, "Failed to get measurements.");
        }
    }

    // GET /measurements/recent
    [HttpGet("measurements/recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 100)
    {
        try
        {
            limit = Math.Clamp(limit, 1, 1000);

            var items = await _db.Measurements
                .OrderByDescending(m => m.Timestamp)
                .Take(limit)
                .ToListAsync();

            var message = $"> Recent measurements fetched: count={items.Count}";
            Console.WriteLine(message);

            return Ok(new
            {
                message,
                count = items.Count,
                data = items.Select(MeasurementOutDTO.FromEntity)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to get recent measurements: {ex.Message}");
            return StatusCode(500, "Failed to get recent measurements.");
        }
    }

    // GET /measurements/{deviceId}/latest
    [HttpGet("measurements/{deviceId}/latest")]
    public async Task<IActionResult> GetLatest(string deviceId)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { errors = new { deviceId = "DeviceId is required." } });

        try
        {
            var item = await _db.Measurements
                .Where(m => m.Device_Id == deviceId)
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefaultAsync();

            if (item is null)
                return NotFound(new { error = "No measurements yet." });

            var message = $"> Latest measurement fetched: device={deviceId}, co2={item.CO2}, ts={item.Timestamp:o}";
            Console.WriteLine(message);

            return Ok(new { message, data = MeasurementOutDTO.FromEntity(item) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to get latest measurement: {ex.Message}");
            return StatusCode(500, "Failed to get latest measurement.");
        }
    }
}
