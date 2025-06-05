using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using api.Models.DTOs;
using api.Services;
using database.Entities;

namespace api.Controllers;

[ApiController]
[Route("api/planets/{planetId}/[controller]")]
[Authorize]
public class FactorController : ControllerBase
{
    private readonly FactorService _factorService;

    public FactorController(FactorService factorService)
    {
        _factorService = factorService;
    }

    [HttpGet]
    public async Task<ActionResult<List<PlanetFactor>>> GetFactors(int planetId)
    {
        var userId = GetCurrentUserId();
        var factors = await _factorService.GetFactorsAsync(planetId, userId);
        return Ok(factors);
    }

    [HttpPost]
    public async Task<ActionResult<PlanetFactor>> AddFactor(int planetId, [FromBody] AddFactorRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var factor = new PlanetFactor
            {
                PlanetId = planetId,
                FactorName = request.FactorName,
                Category = request.Category,
                Value = request.Value,
                Unit = request.Unit,
                DataType = request.DataType,
                Weight = request.Weight,
                Description = request.Description
            };

            var createdFactor = await _factorService.AddFactorAsync(factor, userId);
            return CreatedAtAction(nameof(GetFactors), new { planetId }, createdFactor);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPut("{factorId}")]
    public async Task<ActionResult<PlanetFactor>> UpdateFactor(int planetId, int factorId, [FromBody] UpdateFactorRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var factor = new PlanetFactor
            {
                Id = factorId,
                Value = request.Value,
                Weight = request.Weight,
                Description = request.Description
            };

            var updatedFactor = await _factorService.UpdateFactorAsync(factor, userId);
            return Ok(updatedFactor);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{factorId}")]
    public async Task<ActionResult> DeleteFactor(int planetId, int factorId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _factorService.DeleteFactorAsync(factorId, userId);
            
            if (!success)
                return NotFound();
            
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("batch")]
    public async Task<ActionResult<List<PlanetFactor>>> AddFactorsBatch(int planetId, [FromBody] List<AddFactorRequest> requests)
    {
        try
        {
            var userId = GetCurrentUserId();
            var factors = requests.Select(r => new PlanetFactor
            {
                PlanetId = planetId,
                FactorName = r.FactorName,
                Category = r.Category,
                Value = r.Value,
                Unit = r.Unit,
                DataType = r.DataType,
                Weight = r.Weight,
                Description = r.Description
            }).ToList();

            var createdFactors = await _factorService.AddFactorsBatchAsync(factors, userId);
            return CreatedAtAction(nameof(GetFactors), new { planetId }, createdFactors);
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
