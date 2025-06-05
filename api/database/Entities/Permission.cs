using System.ComponentModel.DataAnnotations;
using database.Enums;

namespace database.Entities;

public class Permission
{
    public int Id { get; set; }
    
    public UserRole Role { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Resource { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty;
    
    public int? PlanetId { get; set; }

    // Navigation properties
    public Planet? Planet { get; set; }
}
