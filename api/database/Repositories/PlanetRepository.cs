using Microsoft.EntityFrameworkCore;
using database.Context;
using database.Entities;

namespace database.Repositories;

public class PlanetRepository : IPlanetRepository
{
    private readonly PlanetContext _context;

    public PlanetRepository(PlanetContext context)
    {
        _context = context;
    }

    public async Task<Planet?> GetByIdAsync(int id)
    {
        return await _context.Planets.FindAsync(id);
    }

    public async Task<Planet> CreateAsync(Planet planet)
    {
        _context.Planets.Add(planet);
        await _context.SaveChangesAsync();
        return planet;
    }

    public async Task<Planet> UpdateAsync(Planet planet)
    {
        _context.Planets.Update(planet);
        await _context.SaveChangesAsync();
        return planet;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var planet = await _context.Planets.FindAsync(id);
        if (planet == null) return false;
        
        _context.Planets.Remove(planet);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Planet>> GetAllAsync()
    {
        return await _context.Planets.ToListAsync();
    }

    public async Task<List<Planet>> GetByUserIdAsync(int userId)
    {
        return await _context.Planets
            .Where(p => p.AssignedUsers.Any(u => u.Id == userId))
            .ToListAsync();
    }
}
