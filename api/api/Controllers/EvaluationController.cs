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
public class EvaluationController : ControllerBase
{
    private readonly EvaluationService _evaluationService;

    public EvaluationController(EvaluationService evaluationService)
    {
        _evaluationService = evaluationService;
    }

    [HttpPost]
    public async Task<ActionResult<Evaluation>> CreateEvaluation([FromBody] EvaluationRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var evaluation = new Evaluation
            {
                PlanetIds = request.PlanetIds,
                Algorithm = request.Algorithm,
                Weights = request.Weights
            };

            var createdEvaluation = await _evaluationService.CreateEvaluationAsync(evaluation, userId);
            return CreatedAtAction(nameof(GetEvaluationResult), new { id = createdEvaluation.Id }, createdEvaluation);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Evaluation>> GetEvaluationResult(int id)
    {
        var userId = GetCurrentUserId();
        var evaluation = await _evaluationService.GetEvaluationResultAsync(id, userId);
        
        if (evaluation == null)
            return NotFound();
        
        return Ok(evaluation);
    }

    [HttpGet]
    public async Task<ActionResult<List<Evaluation>>> GetEvaluationHistory()
    {
        var userId = GetCurrentUserId();
        var evaluations = await _evaluationService.GetEvaluationHistoryAsync(userId);
        return Ok(evaluations);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEvaluation(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _evaluationService.DeleteEvaluationAsync(id, userId);
            
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
