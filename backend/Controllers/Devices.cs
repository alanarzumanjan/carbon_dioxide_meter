using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using Dtos;
using System.Text.RegularExpressions;

namespace Controllers;

[ApiController]
[Route("/devices")]
[Produces("application/json")]
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public DevicesController(AppDbContext db) => _db = db;

    private static string NormalizeMac(string mac)
    {
        var hex = new string(mac.Where(c => Uri.IsHexDigit(c)).ToArray()).ToUpperInvariant();
        if (hex.Length != 12) return mac.Trim();
        return string.Create(17, hex, (span, src) =>
        {
            span[0] = src[0]; span[1] = src[1]; span[2] = ':';
            span[3] = src[2]; span[4] = src[3]; span[5] = ':';
            span[6] = src[4]; span[7] = src[5]; span[8] = ':';
            span[9] = src[6]; span[10] = src[7]; span[11] = ':';
            span[12] = src[8]; span[13] = src[9]; span[14] = ':';
            span[15] = src[10]; span[16] = src[11];
        });
    }

    private static bool IsValidMac(string mac) =>
        Regex.IsMatch(mac, "^[0-9A-F]{2}(:[0-9A-F]{2}){5}$");

    // POST /devices/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DeviceRegisterDTO request)
    {
        if (request is null) return BadRequest(new { error = "Body is required." });
        if (request.UserId == Guid.Empty) return BadRequest(new { error = "UserId is required." });
        if (string.IsNullOrWhiteSpace(request.Id)) return BadRequest(new { error = "Device ID (MAC) is required." });

        var mac = NormalizeMac(request.Id);
        if (!IsValidMac(mac)) return BadRequest(new { error = "Invalid MAC format. Use AA:BB:CC:DD:EE:FF." });

        var name = (request.Name ?? "Unnamed Device").Trim();
        var location = (request.Location ?? "Unknown").Trim();

        try
        {
            if (await _db.Devices.AnyAsync(d => d.Id == mac))
                return Conflict(new { error = "Device with this MAC is already registered." });

            if (!string.IsNullOrEmpty(name))
            {
                var existsName = await _db.Devices
                    .AnyAsync(d => d.User_Id == request.UserId && d.Name != null &&
                                   d.Name.ToLower() == name.ToLower());
                if (existsName)
                    return Conflict(new { error = "Device with this name already exists for this user." });
            }

            if (!string.IsNullOrEmpty(location))
            {
                var existsLocation = await _db.Devices
                    .AnyAsync(d => d.User_Id == request.UserId && d.Location != null &&
                                   d.Location.ToLower() == location.ToLower());
                if (existsLocation)
                    return Conflict(new { error = "Device with this location already exists for this user." });
            }

            var device = new Device
            {
                Id = mac,
                Name = name,
                Location = location,
                Registered_at = DateTime.UtcNow,
                User_Id = request.UserId
            };

            _db.Devices.Add(device);
            await _db.SaveChangesAsync();

            var message = $"> Device '{device.Id}' registered for user {device.User_Id}";
            Console.WriteLine(message);
            return Ok(new { message, data = DeviceOutDTO.FromEntity(device) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to register device: {ex.Message}");
            return StatusCode(500, new { error = "Failed to register device." });
        }
    }

    // GET /devices/user/{userId}
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        try
        {
            var devices = await _db.Devices
                .AsNoTracking()
                .Where(d => d.User_Id == userId)
                .OrderByDescending(d => d.Registered_at)
                .ToListAsync();

            var message = $"> Fetched {devices.Count} devices for user {userId}";
            Console.WriteLine(message);

            var data = devices.Select(d => DeviceOutDTO.FromEntity(d)).ToList();
            return Ok(new { message, data });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to get devices: {ex.Message}");
            return StatusCode(500, new { error = "Failed to get devices." });
        }
    }

    // GET /devices/id/{deviceId}
    [HttpGet("id/{deviceId}")]
    public async Task<IActionResult> GetOne(string deviceId)
    {
        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "DeviceId is required." });

        var mac = NormalizeMac(deviceId);
        if (!IsValidMac(mac))
            return BadRequest(new { error = "Invalid MAC format. Use AA:BB:CC:DD:EE:FF." });

        try
        {
            var device = await _db.Devices.AsNoTracking().FirstOrDefaultAsync(d => d.Id == mac);
            if (device is null)
                return NotFound(new { error = "Device not found." });

            var message = $"> Device '{device.Id}' fetched.";
            Console.WriteLine(message);
            return Ok(new { message, data = DeviceOutDTO.FromEntity(device) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to fetch device: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch device." });
        }
    }
}
