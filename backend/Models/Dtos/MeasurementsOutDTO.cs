using Models;

namespace Dtos;

public class MeasurementOutDTO
{
    public string Id { get; set; } = default!;
    public string? DeviceId { get; set; }
    public int Co2 { get; set; }
    public float? Temperature { get; set; }
    public float? Humidity { get; set; }
    public DateTime CreatedAt { get; set; }

    public static MeasurementOutDTO FromEntity(Measurement m) => new()
    {
        Id = m.Id.ToString(),
        DeviceId = m.Device_Id,
        Co2 = m.Co2,
        Temperature = m.Temperature,
        Humidity = m.Humidity,
        CreatedAt = m.CreatedAt
    };
}
