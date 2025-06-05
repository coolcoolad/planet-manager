using database.Entities;

namespace database.Repositories;

public interface IPlanetFactorRepository
{
    Task<PlanetFactor?> GetByIdAsync(int id);
    Task<PlanetFactor> CreateAsync(PlanetFactor factor);
    Task<PlanetFactor> UpdateAsync(PlanetFactor factor);
    Task<bool> DeleteAsync(int id);
    Task<List<PlanetFactor>> GetAllAsync();
    Task<List<PlanetFactor>> GetByPlanetIdAsync(int planetId);
}
