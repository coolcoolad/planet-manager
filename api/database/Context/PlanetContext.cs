using Microsoft.EntityFrameworkCore;
using database.Entities;

namespace database.Context;

public class PlanetContext : DbContext
{
    public PlanetContext(DbContextOptions<PlanetContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Planet> Planets { get; set; }
    public DbSet<PlanetFactor> PlanetFactors { get; set; }
    public DbSet<Evaluation> Evaluations { get; set; }
    public DbSet<EvaluationResult> EvaluationResults { get; set; }
    public DbSet<EvaluationReport> EvaluationReports { get; set; }
    public DbSet<Chart> Charts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configurations
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasOne(e => e.AssignedPlanet)
                  .WithMany(p => p.AssignedUsers)
                  .HasForeignKey(e => e.AssignedPlanetId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Permission configurations
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Planet)
                  .WithMany(p => p.Permissions)
                  .HasForeignKey(e => e.PlanetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Planet configurations
        modelBuilder.Entity<Planet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name);
        });

        // PlanetFactor configurations
        modelBuilder.Entity<PlanetFactor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Planet)
                  .WithMany(p => p.Factors)
                  .HasForeignKey(e => e.PlanetId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.PlanetId, e.FactorName });
        });

        // Evaluation configurations
        modelBuilder.Entity<Evaluation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.CreatedByUser)
                  .WithMany(u => u.CreatedEvaluations)
                  .HasForeignKey(e => e.CreatedBy)
                  .HasPrincipalKey(u => u.Username)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // EvaluationResult configurations
        modelBuilder.Entity<EvaluationResult>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Evaluation)
                  .WithMany(ev => ev.Results)
                  .HasForeignKey(e => e.EvaluationId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Planet)
                  .WithMany(p => p.EvaluationResults)
                  .HasForeignKey(e => e.PlanetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // EvaluationReport configurations
        modelBuilder.Entity<EvaluationReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Evaluation)
                  .WithOne(ev => ev.Report)
                  .HasForeignKey<EvaluationReport>(e => e.EvaluationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Chart configurations
        modelBuilder.Entity<Chart>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.EvaluationReport)
                  .WithMany(r => r.Charts)
                  .HasForeignKey(e => e.EvaluationReportId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
