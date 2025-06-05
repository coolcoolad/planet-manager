using database.Entities;
using database.Enums;
using database.UnitOfWork;

namespace api.Services;

public class EvaluationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly PermissionService _permissionService;

    public EvaluationService(IUnitOfWork unitOfWork, PermissionService permissionService)
    {
        _unitOfWork = unitOfWork;
        _permissionService = permissionService;
    }

    public async Task<Evaluation> CreateEvaluationAsync(Evaluation evaluation, int userId)
    {
        if (!await _permissionService.CheckPermissionAsync(userId, "Evaluation", "Create"))
            throw new UnauthorizedAccessException("Insufficient permissions to create evaluation");

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        evaluation.CreatedAt = DateTime.UtcNow;
        evaluation.CreatedBy = user?.Username ?? "Unknown";
        evaluation.CreatedByUserId = userId;
        evaluation.Status = EvaluationStatus.PENDING;

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var createdEvaluation = await _unitOfWork.Evaluations.CreateAsync(evaluation);
            await ExecuteEvaluationAsync(createdEvaluation.Id);
            await _unitOfWork.CommitAsync();
            
            return createdEvaluation;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<Evaluation?> GetEvaluationResultAsync(int evaluationId, int userId)
    {
        if (!await _permissionService.CheckPermissionAsync(userId, "Evaluation", "Read"))
            return null;

        return await _unitOfWork.Evaluations.GetByIdAsync(evaluationId);
    }

    public async Task<List<Evaluation>> GetEvaluationHistoryAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user?.Role == UserRole.SUPER_ADMIN)
        {
            return await _unitOfWork.Evaluations.GetAllAsync();
        }

        return await _unitOfWork.Evaluations.GetByUserIdAsync(userId);
    }

    private async Task ExecuteEvaluationAsync(int evaluationId)
    {
        var evaluation = await _unitOfWork.Evaluations.GetByIdAsync(evaluationId);
        if (evaluation == null) return;

        evaluation.Status = EvaluationStatus.IN_PROGRESS;
        await _unitOfWork.Evaluations.UpdateAsync(evaluation);

        try
        {
            var results = new List<EvaluationResult>();

            foreach (var planetId in evaluation.PlanetIds)
            {
                var factors = await _unitOfWork.PlanetFactors.GetByPlanetIdAsync(planetId);
                var score = CalculateScore(factors, evaluation.Weights, evaluation.Algorithm);

                var result = new EvaluationResult
                {
                    EvaluationId = evaluationId,
                    PlanetId = planetId,
                    TotalScore = score,
                    CategoryScores = CalculateCategoryScores(factors, evaluation.Weights),
                    Recommendation = GenerateRecommendation(score),
                    Strengths = GenerateStrengths(factors),
                    Weaknesses = GenerateWeaknesses(factors),
                    Risks = GenerateRisks(factors)
                };

                results.Add(result);
            }

            // Rank the results
            var rankedResults = results.OrderByDescending(r => r.TotalScore).ToList();
            for (int i = 0; i < rankedResults.Count; i++)
            {
                rankedResults[i].Rank = i + 1;
            }

            evaluation.Status = EvaluationStatus.COMPLETED;
            await _unitOfWork.Evaluations.UpdateAsync(evaluation);
        }
        catch
        {
            evaluation.Status = EvaluationStatus.FAILED;
            await _unitOfWork.Evaluations.UpdateAsync(evaluation);
            throw;
        }
    }

    private double CalculateScore(List<PlanetFactor> factors, Dictionary<string, double> weights, EvaluationAlgorithm algorithm)
    {
        // Simplified scoring algorithm
        double totalScore = 0;
        double totalWeight = 0;

        foreach (var factor in factors)
        {
            if (weights.TryGetValue(factor.Category.ToString(), out double weight))
            {
                // Convert factor value to numeric score (simplified)
                double factorScore = ConvertToNumericScore(factor.Value);
                totalScore += factorScore * weight * factor.Weight;
                totalWeight += weight * factor.Weight;
            }
        }

        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    private Dictionary<string, double> CalculateCategoryScores(List<PlanetFactor> factors, Dictionary<string, double> weights)
    {
        var categoryScores = new Dictionary<string, double>();
        
        foreach (var category in Enum.GetValues<FactorCategory>())
        {
            var categoryFactors = factors.Where(f => f.Category == category).ToList();
            if (categoryFactors.Any())
            {
                var avgScore = categoryFactors.Average(f => ConvertToNumericScore(f.Value) * f.Weight);
                categoryScores[category.ToString()] = avgScore;
            }
        }

        return categoryScores;
    }

    private double ConvertToNumericScore(object? value)
    {
        // Simplified conversion - in real implementation, this would be more sophisticated
        if (value == null) return 0;
        
        if (double.TryParse(value.ToString(), out double numericValue))
            return Math.Max(0, Math.Min(10, numericValue)); // Normalize to 0-10 scale
        
        if (bool.TryParse(value.ToString(), out bool boolValue))
            return boolValue ? 10 : 0;
        
        return 5; // Default neutral score for text values
    }

    private string GenerateRecommendation(double score)
    {
        return score switch
        {
            > 8 => "Highly Recommended",
            > 6 => "Recommended",
            > 4 => "Consider with Caution",
            _ => "Not Recommended"
        };
    }

    private List<string> GenerateStrengths(List<PlanetFactor> factors)
    {
        // Simplified implementation
        return factors.Where(f => ConvertToNumericScore(f.Value) > 7)
                     .Select(f => f.FactorName)
                     .Take(3)
                     .ToList();
    }

    private List<string> GenerateWeaknesses(List<PlanetFactor> factors)
    {
        // Simplified implementation
        return factors.Where(f => ConvertToNumericScore(f.Value) < 4)
                     .Select(f => f.FactorName)
                     .Take(3)
                     .ToList();
    }

    private List<string> GenerateRisks(List<PlanetFactor> factors)
    {
        // Simplified implementation
        return factors.Where(f => ConvertToNumericScore(f.Value) < 3)
                     .Select(f => $"Low {f.FactorName}")
                     .Take(2)
                     .ToList();
    }
}
