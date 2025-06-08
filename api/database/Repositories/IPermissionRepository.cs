using database.Entities;
using System.Linq.Expressions;

namespace database.Repositories;

public interface IPermissionRepository
{
    Task<Permission?> GetByIdAsync(int id);
    Task<Permission> CreateAsync(Permission permission);
    Task<Permission> UpdateAsync(Permission permission);
    Task<bool> DeleteAsync(int id);
    Task<List<Permission>> GetAllAsync();
    Task<List<Permission>> Get(Expression<Func<Permission, bool>> exp);
    Task<List<Permission>> GetByUserIdAsync(int userId);
}
