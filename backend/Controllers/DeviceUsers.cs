using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Models;
using Dtos;

namespace Controllers;

[ApiController]
[Route("/device-users")]
[Produces("application/json")]
public class DeviceUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public DeviceUsersController(AppDbContext db) => _db = db;

    private static string NormalizeMac(string mac)
    {
        var hex = new string((mac ?? "").Where(c => Uri.IsHexDigit(c)).ToArray()).ToUpperInvariant();
        if (hex.Length != 12) return (mac ?? "").Trim();
        return string.Join(":", Enumerable.Range(0, 6).Select(i => hex.Substring(i * 2, 2)));
    }

    private static bool IsValidMac(string mac) =>
        Regex.IsMatch(mac, "^[0-9A-F]{2}(:[0-9A-F]{2}){5}$");
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] DeviceLoginRequest req)
    {
        if (req is null) return BadRequest(new { error = "Body is required." });

        var mac = NormalizeMac(req.Mac);
        if (!IsValidMac(mac)) return BadRequest(new { error = "Invalid MAC format. Use AA:BB:CC:DD:EE:FF." });

        var username = (req.Username ?? "").Trim();
        var password = req.Password ?? "";

        if (username.Length == 0 || password.Length == 0)
            return BadRequest(new { error = "Username/password are required." });

        // 1) Validate user credentials
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user?.Password_hash == null || !BCrypt.Net.BCrypt.Verify(password, user.Password_hash))
            return Unauthorized(new { error = "Invalid credentials." });

        // 2) Ensure device exists and is linked to this user
        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == mac);
        if (device == null)
        {
            device = new Device
            {
                Id = mac,
                Name = "ESP32",
                Location = "Unknown",
                Registered_at = DateTime.UtcNow,
                User_Id = user.Id
            };
            _db.Devices.Add(device);
            await _db.SaveChangesAsync();
        }
        else
        {
            if (device.User_Id != user.Id)
                return Forbid("Device is owned by another user.");

            device.LastSeenAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        // 3) Ensure DeviceUser link exists
        var link = await _db.DeviceUsers.FirstOrDefaultAsync(x => x.Device_Id == mac && x.User_Id == user.Id);

        if (link == null || string.IsNullOrWhiteSpace(link.ApiKeyHash))
        {
            var rawKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var hash = BCrypt.Net.BCrypt.HashPassword(rawKey);

            if (link == null)
            {
                link = new DeviceUser
                {
                    Device_Id = mac,
                    User_Id = user.Id,
                    ApiKeyHash = hash,
                    CreatedAt = DateTime.UtcNow
                };
                _db.DeviceUsers.Add(link);
            }
            else
            {
                link.ApiKeyHash = hash;
            }

            await _db.SaveChangesAsync();

            return Ok(new DeviceLoginResponse
            {
                DeviceUsersId = link.Id,
                DeviceId = device.Id_uuid,
                Mac = mac,
                DeviceKey = rawKey,
                KeyIssued = true
            });
        }

        return Ok(new DeviceLoginResponse { DeviceUsersId = link.Id, DeviceId = device.Id_uuid, Mac = mac, DeviceKey = null, KeyIssued = false });
    }

    [HttpPost("enroll")]
    public async Task<IActionResult> Enroll([FromBody] DeviceUsersEnrollRequest req)
    {
        if (req is null) return BadRequest(new { error = "Body is required." });
        if (req.UserId == Guid.Empty) return BadRequest(new { error = "UserId is required." });
        if (string.IsNullOrWhiteSpace(req.DeviceId)) return BadRequest(new { error = "DeviceId is required." });

        var mac = NormalizeMac(req.DeviceId);
        if (!IsValidMac(mac)) return BadRequest(new { error = "Invalid MAC format. Use AA:BB:CC:DD:EE:FF." });

        var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == mac);
        if (device == null)
        {
            device = new Device
            {
                Id = mac,
                Name = "Auto-registered device",
                Location = "Unknown",
                Registered_at = DateTime.UtcNow,
                User_Id = req.UserId
            };
            _db.Devices.Add(device);
            await _db.SaveChangesAsync();
        }

        var existing = await _db.DeviceUsers.FirstOrDefaultAsync(x => x.Device_Id == mac && x.User_Id == req.UserId);
        if (existing != null) return Conflict(new { error = "Already enrolled for this user." });

        var rawKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var hash = BCrypt.Net.BCrypt.HashPassword(rawKey);

        var du = new DeviceUser
        {
            Device_Id = mac,
            User_Id = req.UserId,
            ApiKeyHash = hash,
            CreatedAt = DateTime.UtcNow
        };

        _db.DeviceUsers.Add(du);
        await _db.SaveChangesAsync();

        return Ok(new DeviceUsersEnrollResponse { DeviceUsersId = du.Id, DeviceKey = rawKey });
    }
}
