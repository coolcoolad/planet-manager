using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using api.Models.DTOs;
using api.Services;
using database.Entities;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlanetController : ControllerBase
{
    private readonly PlanetService _planetService;

    public PlanetController(PlanetService planetService)
    {
        _planetService = planetService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Planet>>> GetPlanets()
    {
        var userId = GetCurrentUserId();
        var planets = await _planetService.GetPlanetsAsync(userId);
        return Ok(planets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Planet>> GetPlanet(int id)
    {
        var userId = GetCurrentUserId();
        var planet = await _planetService.GetPlanetAsync(id, userId);
        
        if (planet == null)
            return NotFound();
        
        return Ok(planet);
    }

    [HttpPost]
    public async Task<ActionResult<Planet>> CreatePlanet([FromBody] CreatePlanetRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var planet = new Planet
            {
                Name = request.Name,
                Description = request.Description,
                Location = request.Location,
                DiscoveredDate = request.DiscoveredDate
            };

            var createdPlanet = await _planetService.CreatePlanetAsync(planet, userId);
            return CreatedAtAction(nameof(GetPlanet), new { id = createdPlanet.Id }, createdPlanet);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Planet>> UpdatePlanet(int id, [FromBody] UpdatePlanetRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existingPlanet = await _planetService.GetPlanetAsync(id, userId);
            
            if (existingPlanet == null)
                return NotFound();

            existingPlanet.Name = request.Name;
            existingPlanet.Description = request.Description;
            existingPlanet.Location = request.Location;
            existingPlanet.Status = request.Status;

            var updatedPlanet = await _planetService.UpdatePlanetAsync(existingPlanet, userId);
            return Ok(updatedPlanet);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePlanet(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _planetService.DeletePlanetAsync(id, userId);
            
            if (!success)
                return NotFound();
            
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out int userId) ? userId : 0;
    }
}
