using Microsoft.EntityFrameworkCore;
using Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Measurement> Measurements => Set<Measurement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<User>(u =>
        {
            u.HasKey(x => x.Id);
            u.Property(x => x.Id)
             .ValueGeneratedOnAdd();

            u.HasIndex(x => x.Email).IsUnique();
            u.HasIndex(x => x.Username).IsUnique();

            u.Property(x => x.Username).HasMaxLength(128);
            u.Property(x => x.Email).HasMaxLength(256);

            u.HasMany(x => x.Devices)
             .WithOne(d => d.User)
             .HasForeignKey(d => d.User_Id)
             .OnDelete(DeleteBehavior.Cascade);

            u.HasMany(x => x.Measurements)
             .WithOne(m => m.User)
             .HasForeignKey(m => m.User_Id)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Device>(d =>
        {
            d.HasKey(x => x.Id_uuid);

            d.Property(x => x.Id_uuid)
             .ValueGeneratedOnAdd()
             .HasDefaultValueSql("uuid_generate_v4()");

            d.Property(x => x.Id)
             .IsRequired()
             .HasMaxLength(17);

            d.HasAlternateKey(x => x.Id)
             .HasName("AK_Devices_Id");

            d.HasIndex(x => x.Id).IsUnique();

            d.Property(x => x.Name).HasMaxLength(128);
            d.Property(x => x.Location).HasMaxLength(128);
            d.Property(x => x.ApiKeyHash).HasMaxLength(200);

            d.Property(x => x.Registered_at)
             .HasDefaultValueSql("timezone('utc', now())");

            d.Property(x => x.EnrollmentAt);
            d.Property(x => x.LastSeenAt);

            d.HasMany(x => x.Measurements)
             .WithOne(m => m.Device)
             .HasForeignKey(m => m.Device_Id)
             .HasPrincipalKey(x => x.Id)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Measurement>(m =>
        {
            m.HasKey(x => x.Id);
            m.Property(x => x.Id)
             .ValueGeneratedOnAdd()
             .HasDefaultValueSql("uuid_generate_v4()");

            m.Property(x => x.Device_Id)
             .IsRequired()
             .HasMaxLength(17);

            m.Property(x => x.Timestamp)
             .HasDefaultValueSql("timezone('utc', now())");

            m.HasIndex(x => new { x.Device_Id, x.Timestamp });
            m.HasIndex(x => new { x.User_Id, x.Timestamp });
        });
    }
}
