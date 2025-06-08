using database.Entities;
using System.Linq.Expressions;

namespace database.Repositories;

public interface IPlanetRepository
{
    Task<Planet?> GetByIdAsync(int id);
    Task<Planet> CreateAsync(Planet planet);
    Task<Planet> UpdateAsync(Planet planet);
    Task<bool> DeleteAsync(int id);
    Task<List<Planet>> GetAllAsync();
    Task<List<Planet>> Get(Expression<Func<Planet, bool>> exp);
    Task<List<Planet>> GetByUserIdAsync(int userId);
}
