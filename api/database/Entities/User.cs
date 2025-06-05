using System.ComponentModel.DataAnnotations;
using database.Enums;

namespace database.Entities;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    public string Salt { get; set; } = string.Empty;
    
    public UserRole Role { get; set; }
    
    public int? AssignedPlanetId { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Planet? AssignedPlanet { get; set; }
    public List<Evaluation> CreatedEvaluations { get; set; } = new();

    public bool ValidatePassword(string password)
    {
        // Implementation for password validation
        return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
    }

    public void UpdatePassword(string newPassword)
    {
        Salt = BCrypt.Net.BCrypt.GenerateSalt();
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, Salt);
    }
}
