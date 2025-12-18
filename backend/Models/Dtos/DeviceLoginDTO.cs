namespace Dtos;

public sealed class DeviceLoginRequest
{
    public string Mac { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
}

public sealed class DeviceLoginResponse
{
    public Guid DeviceUsersId { get; set; }
    public Guid DeviceId { get; set; }      // Device.Id_uuid
    public string Mac { get; set; } = default!;
    public string? DeviceKey { get; set; }
    public bool KeyIssued { get; set; }
}
