using database.Entities;
using database.Enums;
using database.UnitOfWork;

namespace api.Services;

public class PermissionService
{
    private readonly IUnitOfWork _unitOfWork;

    public PermissionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> CheckPermissionAsync(int userId, string resource, string action, int? resourceId = null)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || !user.IsActive) return false;

        // Super admin has all permissions
        if (user.Role == UserRole.SUPER_ADMIN) return true;

        // Check specific permissions
        var permissions = await _unitOfWork.Permissions.GetByUserIdAsync(userId);
        
        return permissions.Any(p => 
            p.Resource == resource && 
            p.Action == action && 
            (p.PlanetId == null || p.PlanetId == resourceId));
    }

    public async Task<bool> HasAccessToPlanetAsync(int userId, int planetId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || !user.IsActive) return false;

        // Super admin has access to all planets
        if (user.Role == UserRole.SUPER_ADMIN) return true;

        // Planet admin has access to their assigned planet
        if (user.Role == UserRole.PLANET_ADMIN && user.AssignedPlanetId == planetId) return true;

        // Check specific planet permissions
        return await CheckPermissionAsync(userId, "Planet", "Read", planetId);
    }

    public async Task<List<Permission>> GetUserPermissionsAsync(int userId)
    {
        return await _unitOfWork.Permissions.GetByUserIdAsync(userId);
    }
}
