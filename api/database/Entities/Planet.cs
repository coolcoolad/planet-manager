using System.ComponentModel.DataAnnotations;
using database.Enums;

namespace database.Entities;

public class Planet
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Location { get; set; } = string.Empty;
    
    public DateTime DiscoveredDate { get; set; }
    
    public PlanetStatus Status { get; set; } = PlanetStatus.DISCOVERED;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public List<PlanetFactor> Factors { get; set; } = new();
    public List<EvaluationResult> EvaluationResults { get; set; } = new();
    public List<User> AssignedUsers { get; set; } = new();
    public List<Permission> Permissions { get; set; } = new();
}
