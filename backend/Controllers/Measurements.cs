using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
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
    private readonly string? _intakeKey; // dev backdoor (INTAKE_API_KEY)

    public MeasurementsController(AppDbContext db)
    {
        _db = db;
        _intakeKey = Environment.GetEnvironmentVariable("INTAKE_API_KEY");
    }

    private static string NormalizeMac(string mac)
    {
        if (string.IsNullOrWhiteSpace(mac)) return mac ?? string.Empty;
        var hex = new string(mac.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
        if (hex.Length != 12) return mac.Trim();
        return string.Join(":", Enumerable.Range(0, 6).Select(i => hex.Substring(i * 2, 2)));
    }

    private bool IntakeAuthorized(Microsoft.AspNetCore.Http.HttpRequest req)
    {
        // Dev backdoor: allow when header matches INTAKE_API_KEY (non-empty)
        if (!string.IsNullOrWhiteSpace(_intakeKey) &&
            req.Headers.TryGetValue("X-Api-Key", out var key) &&
            key.ToString() == _intakeKey)
        {
            return true;
        }
        return false;
    }


    [HttpPost("measurements")]
    public async Task<IActionResult> Ingest([FromBody] MeasurementInDTO request)
    {
        // Basic field validation
        var errors = new Dictionary<string, string>();
        if (request == null) return BadRequest(new { error = "Body is required." });

        if (string.IsNullOrWhiteSpace(request.DeviceId)) errors["deviceId"] = "DeviceId is required.";
        if (request.UserId == Guid.Empty) errors["userId"] = "UserId is required.";
        if (request.CO2 <= 0 || request.CO2 > 10_000) errors["co2"] = "CO2 value is invalid.";
        if (errors.Count > 0) return BadRequest(new { errors });

        try
        {
            // Normalize MAC always
            var mac = NormalizeMac(request.DeviceId);

            // Ensure Device exists (soft auto-register with safe defaults)
            var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == mac);
            if (device == null)
            {
                device = new Device
                {
                    Id = mac,
                    Name = "Auto-registered device",
                    Location = "Unknown",
                    Registered_at = DateTime.UtcNow,
                    User_Id = request.UserId // временно привязываем к приславшему юзеру
                };
                _db.Devices.Add(device);
                await _db.SaveChangesAsync();
            }

            // Find user↔device link (device_users)
            var link = await _db.DeviceUsers
                .FirstOrDefaultAsync(x => x.Device_Id == mac && x.User_Id == request.UserId);

            if (link == null)
            {
                // If dev backdoor is NOT enabled and no link — deny
                if (!IntakeAuthorized(Request))
                    return Unauthorized(new { error = "Device is not enrolled for this user." });

                // If backdoor is enabled — create link on the fly without ApiKeyHash
                link = new DeviceUser
                {
                    Device_Id = mac,
                    User_Id = request.UserId,
                    ApiKeyHash = null,
                    CreatedAt = DateTime.UtcNow
                };
                _db.DeviceUsers.Add(link);
                await _db.SaveChangesAsync();
            }

            // Verify device key unless dev backdoor already authorized
            if (!IntakeAuthorized(Request))
            {
                if (!Request.Headers.TryGetValue("X-Api-Key", out var rawKey) || string.IsNullOrWhiteSpace(rawKey))
                    return Unauthorized(new { error = "X-Api-Key is required." });

                if (string.IsNullOrWhiteSpace(link.ApiKeyHash) || !BCrypt.Net.BCrypt.Verify(rawKey.ToString(), link.ApiKeyHash))
                    return Unauthorized(new { error = "Invalid device key." });
            }

            var ts = (request.Timestamp ?? DateTime.UtcNow).ToUniversalTime();

            var entity = new Measurement
            {
                Id = Guid.NewGuid(),
                Device_Id = mac,
                User_Id = request.UserId,
                Device_Users_Id = link.Id,
                CO2 = request.CO2,
                Temperature = request.Temperature,
                Humidity = request.Humidity,
                Timestamp = ts
            };

            _db.Measurements.Add(entity);
            await _db.SaveChangesAsync();

            var message = $"> Measurement ingested: device={mac}, link={link.Id}, co2={request.CO2}, ts={ts:o}";
            Console.WriteLine(message);

            return Ok(new { message, data = MeasurementOutDTO.FromEntity(entity) });
        }
        catch (DbUpdateException dbex)
        {
            Console.WriteLine($"❌ DB error on ingest: {dbex.Message}");
            return StatusCode(500, new { error = "Database error while saving measurement." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to ingest measurement: {ex.Message}");
            return StatusCode(500, new { error = "Failed to ingest measurement." });
        }
    }

    [HttpGet("measurements/{deviceId}")]
    public async Task<IActionResult> GetByDevice(string deviceId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        try
        {
            limit = Math.Clamp(limit, 1, 1000);
            offset = Math.Max(0, offset);
            var mac = NormalizeMac(deviceId);

            var query = _db.Measurements
                .AsNoTracking()
                .Where(m => m.Device_Id == mac)
                .OrderByDescending(m => m.Timestamp);

            var total = await query.CountAsync();
            var items = await query.Skip(offset).Take(limit).ToListAsync();

            return Ok(new
            {
                total,
                limit,
                offset,
                data = items.Select(MeasurementOutDTO.FromEntity)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to fetch by device: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch measurements." });
        }
    }

    [HttpGet("measurements/by-link/{deviceUsersId:guid}")]
    public async Task<IActionResult> GetByLink(Guid deviceUsersId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        if (deviceUsersId == Guid.Empty)
            return BadRequest(new { errors = new { deviceUsersId = "Required" } });

        try
        {
            limit = Math.Clamp(limit, 1, 1000);
            offset = Math.Max(0, offset);

            var query = _db.Measurements
                .AsNoTracking()
                .Where(m => m.Device_Users_Id == deviceUsersId)
                .OrderByDescending(m => m.Timestamp);

            var total = await query.CountAsync();
            var items = await query.Skip(offset).Take(limit).ToListAsync();

            return Ok(new
            {
                total,
                limit,
                offset,
                data = items.Select(MeasurementOutDTO.FromEntity)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to fetch by link: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch measurements." });
        }
    }

    [HttpGet("measurements/recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        try
        {
            limit = Math.Clamp(limit, 1, 1000);
            offset = Math.Max(0, offset);

            var query = _db.Measurements
                .AsNoTracking()
                .OrderByDescending(m => m.Timestamp);

            var total = await query.CountAsync();
            var items = await query.Skip(offset).Take(limit).ToListAsync();

            return Ok(new
            {
                total,
                limit,
                offset,
                data = items.Select(MeasurementOutDTO.FromEntity)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to fetch recent: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch measurements." });
        }
    }

    [HttpGet("measurements/{deviceId}/latest")]
    public async Task<IActionResult> GetLatestByDevice(string deviceId)
    {
        try
        {
            var mac = NormalizeMac(deviceId);

            var item = await _db.Measurements
                .AsNoTracking()
                .Where(m => m.Device_Id == mac)
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound(new { error = "No measurements yet." });

            var message = $"> Latest measurement fetched: device={mac}, co2={item.CO2}, ts={item.Timestamp:o}";
            Console.WriteLine(message);

            return Ok(new { message, data = MeasurementOutDTO.FromEntity(item) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to get latest measurement: {ex.Message}");
            return StatusCode(500, new { error = "Failed to get latest measurement." });
        }
    }
}
