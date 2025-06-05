using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using api.Models.DTOs;
using database.Entities;
using database.UnitOfWork;

namespace api.Services;

public class AuthenticationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthenticationService(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<AuthResult> LoginAsync(string username, string password)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByUsernameAsync(username);
            if (user == null || !user.ValidatePassword(password) || !user.IsActive)
            {
                return new AuthResult { Success = false, ErrorMessage = "Invalid credentials" };
            }

            var accessToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            return new AuthResult
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                User = user
            };
        }
        catch (Exception ex)
        {
            return new AuthResult { Success = false, ErrorMessage = ex.Message };
        }
    }

    public async Task<AuthResult> RefreshTokenAsync(string refreshToken)
    {
        // In a real implementation, you'd validate the refresh token against a store
        // For now, we'll just return a new token
        try
        {
            var principal = ValidateToken(refreshToken);
            if (principal == null) return new AuthResult { Success = false, ErrorMessage = "Invalid refresh token" };

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return new AuthResult { Success = false, ErrorMessage = "Invalid token" };

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null || !user.IsActive)
                return new AuthResult { Success = false, ErrorMessage = "User not found or inactive" };

            var newAccessToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            return new AuthResult
            {
                Success = true,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                User = user
            };
        }
        catch
        {
            return new AuthResult { Success = false, ErrorMessage = "Invalid refresh token" };
        }
    }

    public async Task<AuthResult> RegisterAsync(string username, string email, string password)
    {
        try
        {
            // Check if user already exists
            var existingUser = await _unitOfWork.Users.GetByUsernameAsync(username);
            if (existingUser != null)
            {
                return new AuthResult { Success = false, ErrorMessage = "Username already exists" };
            }

            // Create new user
            var user = new User
            {
                Username = username,
                Email = email,
                Role = database.Enums.UserRole.VIEWER_TYPE_1, // Default role
                IsActive = true
            };
            
            user.UpdatePassword(password);
            
            var createdUser = await _unitOfWork.Users.CreateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var accessToken = GenerateJwtToken(createdUser);
            var refreshToken = GenerateRefreshToken();

            return new AuthResult
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                User = createdUser
            };
        }
        catch (Exception ex)
        {
            return new AuthResult { Success = false, ErrorMessage = ex.Message };
        }
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"] ?? "default-secret-key"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString();
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"] ?? "default-secret-key");
            
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };

            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }
        catch
        {
            return null;
        }
    }
}
