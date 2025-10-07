using Models;

namespace Dtos;

public class MeasurementOutDTO
{
    public Guid Id { get; set; }
    public string? DeviceId { get; set; }
    public double CO2 { get; set; }
    public double Temperature { get; set; }
    public double Humidity { get; set; }
    public DateTime Timestamp { get; set; }
    public Guid UserId { get; set; }

    public static MeasurementOutDTO FromEntity(Measurement m) => new()
    {
        Id = m.Id,
        DeviceId = m.Device_Id,
        CO2 = m.CO2,
        Temperature = m.Temperature,
        Humidity = m.Humidity,
        Timestamp = m.Timestamp,
        UserId = m.User_Id
    };
}
