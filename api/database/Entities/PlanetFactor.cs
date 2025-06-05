using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using database.Enums;

namespace database.Entities;

public class PlanetFactor
{
    public int Id { get; set; }
    
    public int PlanetId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string FactorName { get; set; } = string.Empty;
    
    public FactorCategory Category { get; set; }
    
    [Required]
    public string ValueJson { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Unit { get; set; } = string.Empty;
    
    public FactorType DataType { get; set; }
    
    public double Weight { get; set; } = 1.0;
    
    public string Description { get; set; } = string.Empty;
    
    public DateTime RecordedAt { get; set; }
    
    [MaxLength(100)]
    public string RecordedBy { get; set; } = string.Empty;

    // Navigation properties
    public Planet Planet { get; set; } = null!;

    // Helper property for Value
    public object? Value
    {
        get => string.IsNullOrEmpty(ValueJson) ? null : JsonSerializer.Deserialize<object>(ValueJson);
        set => ValueJson = value == null ? string.Empty : JsonSerializer.Serialize(value);
    }
}
