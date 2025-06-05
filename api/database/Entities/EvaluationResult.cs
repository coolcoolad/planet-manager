using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace database.Entities;

public class EvaluationResult
{
    public int Id { get; set; }
    
    public int EvaluationId { get; set; }
    
    public int PlanetId { get; set; }
    
    public double TotalScore { get; set; }
    
    [Required]
    public string CategoryScoresJson { get; set; } = string.Empty;
    
    public int Rank { get; set; }
    
    public string Recommendation { get; set; } = string.Empty;
    
    [Required]
    public string StrengthsJson { get; set; } = string.Empty;
    
    [Required]
    public string WeaknessesJson { get; set; } = string.Empty;
    
    [Required]
    public string RisksJson { get; set; } = string.Empty;

    // Navigation properties
    public Evaluation Evaluation { get; set; } = null!;
    public Planet Planet { get; set; } = null!;

    // Helper properties
    public Dictionary<string, double> CategoryScores
    {
        get => string.IsNullOrEmpty(CategoryScoresJson) ? new() : JsonSerializer.Deserialize<Dictionary<string, double>>(CategoryScoresJson) ?? new();
        set => CategoryScoresJson = JsonSerializer.Serialize(value);
    }

    public List<string> Strengths
    {
        get => string.IsNullOrEmpty(StrengthsJson) ? new() : JsonSerializer.Deserialize<List<string>>(StrengthsJson) ?? new();
        set => StrengthsJson = JsonSerializer.Serialize(value);
    }

    public List<string> Weaknesses
    {
        get => string.IsNullOrEmpty(WeaknessesJson) ? new() : JsonSerializer.Deserialize<List<string>>(WeaknessesJson) ?? new();
        set => WeaknessesJson = JsonSerializer.Serialize(value);
    }

    public List<string> Risks
    {
        get => string.IsNullOrEmpty(RisksJson) ? new() : JsonSerializer.Deserialize<List<string>>(RisksJson) ?? new();
        set => RisksJson = JsonSerializer.Serialize(value);
    }
}
