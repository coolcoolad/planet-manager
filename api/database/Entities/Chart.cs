using System.ComponentModel.DataAnnotations;
using database.Enums;

namespace database.Entities;

public class Chart
{
    public int Id { get; set; }
    
    public int EvaluationReportId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public ChartType Type { get; set; }
    
    [Required]
    public string Data { get; set; } = string.Empty;
    
    public string Configuration { get; set; } = string.Empty;

    // Navigation properties
    public EvaluationReport EvaluationReport { get; set; } = null!;
}
