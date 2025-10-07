using Models;

namespace Dtos;

public class DeviceOutDTO
{
    public string Id { get; set; } = default!;
    public string? Name { get; set; }
    public string? Location { get; set; }
    public DateTime Registered_at { get; set; }
    public Guid User_Id { get; set; }

    public static DeviceOutDTO FromEntity(Devices d) => new()
    {
        Id = d.Id!,
        Name = d.Name,
        Location = d.Location,
        Registered_at = d.Registered_at,
        User_Id = d.User_Id
    };
}
