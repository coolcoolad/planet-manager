using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using database.Enums;

namespace database.Entities;

public class Evaluation
{
    public int Id { get; set; }
    
    [Required]
    public string PlanetIdsJson { get; set; } = string.Empty;
    
    public EvaluationAlgorithm Algorithm { get; set; }
    
    [Required]
    public string WeightsJson { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    
    [MaxLength(100)]
    public string? CreatedBy { get; set; }
    
    public int? CreatedByUserId { get; set; }
    
    public EvaluationStatus Status { get; set; } = EvaluationStatus.PENDING;

    // Navigation properties
    public List<EvaluationResult> Results { get; set; } = new();
    public EvaluationReport? Report { get; set; }
    public User? CreatedByUser { get; set; }

    // Helper properties
    [NotMapped]
    public List<int> PlanetIds
    {
        get => string.IsNullOrEmpty(PlanetIdsJson) ? new() : JsonSerializer.Deserialize<List<int>>(PlanetIdsJson) ?? new();
        set => PlanetIdsJson = JsonSerializer.Serialize(value);
    }

    [NotMapped]
    public Dictionary<string, double> Weights
    {
        get => string.IsNullOrEmpty(WeightsJson) ? new() : JsonSerializer.Deserialize<Dictionary<string, double>>(WeightsJson) ?? new();
        set => WeightsJson = JsonSerializer.Serialize(value);
    }
}
