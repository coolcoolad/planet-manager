using System.ComponentModel.DataAnnotations;

namespace database.Entities;

public class EvaluationReport
{
    public int Id { get; set; }
    
    public int EvaluationId { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;
    
    public string Summary { get; set; } = string.Empty;
    
    public string DetailedAnalysis { get; set; } = string.Empty;
    
    public DateTime GeneratedAt { get; set; }

    // Navigation properties
    public Evaluation Evaluation { get; set; } = null!;
    public List<Chart> Charts { get; set; } = new();
}
