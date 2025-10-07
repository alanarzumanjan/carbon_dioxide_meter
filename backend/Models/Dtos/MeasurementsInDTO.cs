namespace Dtos;

public class MeasurementInDTO
{
    public string DeviceId { get; set; } = default!;
    public double CO2 { get; set; }
    public double Temperature { get; set; }
    public double Humidity { get; set; }
    public DateTime? Timestamp { get; set; }
    public Guid UserId { get; set; }
}
