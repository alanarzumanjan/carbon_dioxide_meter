using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
namespace Models;

[Index(nameof(Email), IsUnique = true)]
[Index(nameof(Username), IsUnique = true)]

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(128)]
    public string? Username { get; set; }

    [Required, MaxLength(256)]
    [EmailAddress]
    public string? Email { get; set; }

    [JsonIgnore]
    [Required]
    public string? Password_hash { get; set; }

    public ICollection<Device> Devices { get; set; } = new List<Device>();
    public ICollection<Measurement> Measurements { get; set; } = new List<Measurement>();
}

[Index(nameof(Id), IsUnique = true)]
public class Device
{
    [Key]
    public Guid Id_uuid { get; set; } = Guid.NewGuid();

    [Required, MaxLength(17)]
    public string? Id { get; set; } = default!;

    [Required, MaxLength(128)]
    public string? Name { get; set; }

    [Required, MaxLength(128)]
    public string? Location { get; set; }
    public DateTime Registered_at { get; set; }

    [Required]
    public Guid User_Id { get; set; }
    public User? User { get; set; }

    [MaxLength(200)]
    public string? ApiKeyHash { get; set; }

    public DateTime? EnrollmentAt { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public ICollection<Measurement> Measurements { get; set; } = new List<Measurement>();
}

[Index(nameof(Device_Id), nameof(Timestamp), IsUnique = false)]
[Index(nameof(User_Id), nameof(Timestamp), IsUnique = false)]
public class Measurement
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public double Temperature { get; set; }
    public double CO2 { get; set; }
    public double Humidity { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Required, MaxLength(17)]
    [ForeignKey(nameof(Device))]
    public string? Device_Id { get; set; }

    public Device? Device { get; set; }
    [Required]
    public Guid User_Id { get; set; }

    public User? User { get; set; }
    public Guid Device_Users_Id { get; set; }
    public DeviceUser? DeviceUser { get; set; }
}

public class DeviceUser
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(17)]
    public string? Device_Id { get; set; }

    [Required]
    public Guid User_Id { get; set; }

    [MaxLength(200)]
    public string? ApiKeyHash { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Device? Device { get; set; }
    public User? User { get; set; }
}
