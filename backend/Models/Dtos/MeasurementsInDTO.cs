namespace Dtos;

public class MeasurementInDTO
{
    public string DeviceId { get; set; } = default!;
    public int Co2 { get; set; }
    public float? Temperature { get; set; }
    public float? Humidity { get; set; }
    public DateTime? Timestamp { get; set; }
}
