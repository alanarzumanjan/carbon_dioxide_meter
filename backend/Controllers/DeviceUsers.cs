using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Models;
using Dtos;

[ApiController]
[Route("/device-users")]
public class DeviceUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public DeviceUsersController(AppDbContext db) => _db = db;

    private static string NormalizeMac(string mac)
    {
        var hex = new string(mac.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
        if (hex.Length != 12) return mac.Trim();
        return string.Join(":", Enumerable.Range(0, 6).Select(i => hex.Substring(i*2, 2)));
    }

    [HttpPost("enroll")]
    public async Task<IActionResult> Enroll([FromBody] DeviceUsersEnrollRequest req)
    {
        if (req is null) return BadRequest(new { error = "Body is required." });
        if (req.UserId == Guid.Empty) return BadRequest(new { error = "UserId is required." });
        if (string.IsNullOrWhiteSpace(req.DeviceId)) return BadRequest(new { error = "DeviceId is required." });

        var mac = NormalizeMac(req.DeviceId);

        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == mac);
        if (device == null)
        {
            device = new Device { Id = mac, Name = "Auto-registered device", Location = "Unknown",
                                  Registered_at = DateTime.UtcNow, User_Id = req.UserId };
            _db.Devices.Add(device);
            await _db.SaveChangesAsync();
        }

        var existing = await _db.DeviceUsers.FirstOrDefaultAsync(x => x.Device_Id == mac && x.User_Id == req.UserId);
        if (existing != null) return Conflict(new { error = "Already enrolled for this user." });

        var rawKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var hash = BCrypt.Net.BCrypt.HashPassword(rawKey);

        var du = new DeviceUser { Device_Id = mac, User_Id = req.UserId, ApiKeyHash = hash, CreatedAt = DateTime.UtcNow };
        _db.DeviceUsers.Add(du);
        await _db.SaveChangesAsync();

        return Ok(new DeviceUsersEnrollResponse { DeviceUsersId = du.Id, DeviceKey = rawKey });
    }
}
