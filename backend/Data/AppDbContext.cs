using Microsoft.EntityFrameworkCore;
using Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Devices> Devices => Set<Devices>();
    public DbSet<Measurement> Measurements => Set<Measurement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<Devices>()
            .HasKey(d => d.Id);

        modelBuilder.Entity<Devices>()
            .Property(d => d.Id)
            .HasColumnType("text")
            .HasDefaultValueSql("uuid_generate_v4()::text");

        modelBuilder.Entity<Measurement>()
            .Property(m => m.Device_Id)
            .HasColumnType("text");

        modelBuilder.Entity<Measurement>()
            .HasOne(m => m.Device)
            .WithMany()
            .HasForeignKey(m => m.Device_Id)
            .OnDelete(DeleteBehavior.SetNull);
    }

}
