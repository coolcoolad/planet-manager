using database.Entities;
using database.UnitOfWork;

namespace api.Services;

public class FactorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly PermissionService _permissionService;

    public FactorService(IUnitOfWork unitOfWork, PermissionService permissionService)
    {
        _unitOfWork = unitOfWork;
        _permissionService = permissionService;
    }

    public async Task<List<PlanetFactor>> GetFactorsAsync(int planetId, int userId)
    {
        if (!await _permissionService.HasAccessToPlanetAsync(userId, planetId))
            return new List<PlanetFactor>();

        return await _unitOfWork.PlanetFactors.GetByPlanetIdAsync(planetId);
    }

    public async Task<PlanetFactor> AddFactorAsync(PlanetFactor factor, int userId)
    {
        if (!await _permissionService.HasAccessToPlanetAsync(userId, factor.PlanetId))
            throw new UnauthorizedAccessException("Insufficient permissions to add factor");

        factor.RecordedAt = DateTime.UtcNow;
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        factor.RecordedBy = user?.Username ?? "Unknown";

        return await _unitOfWork.PlanetFactors.CreateAsync(factor);
    }

    public async Task<PlanetFactor> UpdateFactorAsync(PlanetFactor factor, int userId)
    {
        var existingFactor = await _unitOfWork.PlanetFactors.GetByIdAsync(factor.Id);
        if (existingFactor == null)
            throw new ArgumentException("Factor not found");

        if (!await _permissionService.HasAccessToPlanetAsync(userId, existingFactor.PlanetId))
            throw new UnauthorizedAccessException("Insufficient permissions to update factor");

        factor.PlanetId = existingFactor.PlanetId; // Ensure planet ID doesn't change
        factor.RecordedAt = DateTime.UtcNow;
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        factor.RecordedBy = user?.Username ?? "Unknown";

        return await _unitOfWork.PlanetFactors.UpdateAsync(factor);
    }

    public async Task<bool> DeleteFactorAsync(int factorId, int userId)
    {
        var factor = await _unitOfWork.PlanetFactors.GetByIdAsync(factorId);
        if (factor == null) return false;

        if (!await _permissionService.HasAccessToPlanetAsync(userId, factor.PlanetId))
            throw new UnauthorizedAccessException("Insufficient permissions to delete factor");

        return await _unitOfWork.PlanetFactors.DeleteAsync(factorId);
    }

    public async Task<List<PlanetFactor>> AddFactorsBatchAsync(List<PlanetFactor> factors, int userId)
    {
        if (factors.Count == 0) return new List<PlanetFactor>();

        var planetId = factors.First().PlanetId;
        if (!await _permissionService.HasAccessToPlanetAsync(userId, planetId))
            throw new UnauthorizedAccessException("Insufficient permissions to add factors");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            var createdFactors = new List<PlanetFactor>();

            foreach (var factor in factors)
            {
                factor.RecordedAt = DateTime.UtcNow;
                factor.RecordedBy = user?.Username ?? "Unknown";
                var created = await _unitOfWork.PlanetFactors.CreateAsync(factor);
                createdFactors.Add(created);
            }

            await _unitOfWork.CommitAsync();
            return createdFactors;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
