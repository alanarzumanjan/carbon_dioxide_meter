namespace Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Password_hash { get; set; }

    public ICollection<Devices> Devices { get; set; } = new List<Devices>();
    public ICollection<Measurement> Measurements { get; set; } = new List<Measurement>();
}

public class Devices
{
    public string? Id { get; set; } = default!;
    public string? Name { get; set; }
    public string? Location { get; set; }
    public DateTime Registered_at { get; set; }

    public Guid User_Id { get; set; }
    public User? User { get; set; }

    public ICollection<Measurement> Measurements { get; set; } = new List<Measurement>();
}

public class Measurement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public double Temperature { get; set; }
    public double CO2 { get; set; }
    public double Humidity { get; set; }
    public DateTime Timestamp { get; set; }

    public string? Device_Id { get; set; }
    public Devices? Device { get; set; }

    public Guid User_Id { get; set; }
    public User? User { get; set; }
}
