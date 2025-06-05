using Microsoft.AspNetCore.Mvc;
using api.Models.DTOs;
using api.Services;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthenticationService _authService;

    public AuthController(AuthenticationService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResult>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request.Username, request.Password);
        
        if (!result.Success)
            return Unauthorized(result);
        
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResult>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request.Username, request.Email, request.Password);
        
        if (!result.Success)
            return BadRequest(result);
        
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResult>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        
        if (!result.Success)
            return Unauthorized(result);
        
        return Ok(result);
    }

    [HttpPost("logout")]
    public ActionResult Logout()
    {
        // In a real implementation, you'd invalidate the token
        return Ok(new { message = "Logged out successfully" });
    }
}
