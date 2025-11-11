using Models;

namespace Dtos;

public sealed class DeviceOutDTO
{
    public string Id { get; init; } = default!;
    public string? Name { get; init; }
    public string? Location { get; init; }
    public DateTime Registered_at { get; init; }
    public Guid User_Id { get; init; }

    public static DeviceOutDTO FromEntity(Device d) => new()
    {
        Id = d.Id!,
        Name = d.Name,
        Location = d.Location,
        Registered_at = d.Registered_at,
        User_Id = d.User_Id
    };
}
