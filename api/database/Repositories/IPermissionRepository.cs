using database.Entities;

namespace database.Repositories;

public interface IPermissionRepository
{
    Task<Permission?> GetByIdAsync(int id);
    Task<Permission> CreateAsync(Permission permission);
    Task<Permission> UpdateAsync(Permission permission);
    Task<bool> DeleteAsync(int id);
    Task<List<Permission>> GetAllAsync();
    Task<List<Permission>> GetByUserIdAsync(int userId);
}
