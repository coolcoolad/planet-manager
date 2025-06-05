using Microsoft.EntityFrameworkCore;
using database.Context;
using database.Entities;

namespace database.Repositories;

public class PlanetFactorRepository : IPlanetFactorRepository
{
    private readonly PlanetContext _context;

    public PlanetFactorRepository(PlanetContext context)
    {
        _context = context;
    }

    public async Task<PlanetFactor?> GetByIdAsync(int id)
    {
        return await _context.PlanetFactors
            .Include(pf => pf.Planet)
            .FirstOrDefaultAsync(pf => pf.Id == id);
    }

    public async Task<PlanetFactor> CreateAsync(PlanetFactor factor)
    {
        factor.RecordedAt = DateTime.UtcNow;
        _context.PlanetFactors.Add(factor);
        await _context.SaveChangesAsync();
        return factor;
    }

    public async Task<PlanetFactor> UpdateAsync(PlanetFactor factor)
    {
        _context.PlanetFactors.Update(factor);
        await _context.SaveChangesAsync();
        return factor;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var factor = await _context.PlanetFactors.FindAsync(id);
        if (factor == null) return false;
        
        _context.PlanetFactors.Remove(factor);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<PlanetFactor>> GetAllAsync()
    {
        return await _context.PlanetFactors
            .Include(pf => pf.Planet)
            .ToListAsync();
    }

    public async Task<List<PlanetFactor>> GetByPlanetIdAsync(int planetId)
    {
        return await _context.PlanetFactors
            .Where(pf => pf.PlanetId == planetId)
            .Include(pf => pf.Planet)
            .ToListAsync();
    }
}
