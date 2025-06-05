using database.Entities;
using database.UnitOfWork;

namespace api.Services;

public class PlanetService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly PermissionService _permissionService;

    public PlanetService(IUnitOfWork unitOfWork, PermissionService permissionService)
    {
        _unitOfWork = unitOfWork;
        _permissionService = permissionService;
    }

    public async Task<List<Planet>> GetPlanetsAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) return new List<Planet>();

        if (user.Role == database.Enums.UserRole.SUPER_ADMIN)
        {
            return await _unitOfWork.Planets.GetAllAsync();
        }

        return await _unitOfWork.Planets.GetByUserIdAsync(userId);
    }

    public async Task<Planet?> GetPlanetAsync(int planetId, int userId)
    {
        if (!await _permissionService.HasAccessToPlanetAsync(userId, planetId))
            return null;

        return await _unitOfWork.Planets.GetByIdAsync(planetId);
    }

    public async Task<Planet> CreatePlanetAsync(Planet planet, int userId)
    {
        if (!await _permissionService.CheckPermissionAsync(userId, "Planet", "Create"))
            throw new UnauthorizedAccessException("Insufficient permissions to create planet");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            planet.CreatedAt = DateTime.UtcNow;
            planet.UpdatedAt = DateTime.UtcNow;
            
            var createdPlanet = await _unitOfWork.Planets.CreateAsync(planet);
            await _unitOfWork.CommitAsync();
            
            return createdPlanet;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<Planet> UpdatePlanetAsync(Planet planet, int userId)
    {
        if (!await _permissionService.CheckPermissionAsync(userId, "Planet", "Update", planet.Id))
            throw new UnauthorizedAccessException("Insufficient permissions to update planet");

        planet.UpdatedAt = DateTime.UtcNow;
        return await _unitOfWork.Planets.UpdateAsync(planet);
    }

    public async Task<bool> DeletePlanetAsync(int planetId, int userId)
    {
        if (!await _permissionService.CheckPermissionAsync(userId, "Planet", "Delete", planetId))
            throw new UnauthorizedAccessException("Insufficient permissions to delete planet");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Delete associated factors first
            var factors = await _unitOfWork.PlanetFactors.GetByPlanetIdAsync(planetId);
            foreach (var factor in factors)
            {
                await _unitOfWork.PlanetFactors.DeleteAsync(factor.Id);
            }

            var result = await _unitOfWork.Planets.DeleteAsync(planetId);
            await _unitOfWork.CommitAsync();
            
            return result;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
