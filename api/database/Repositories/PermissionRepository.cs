using Microsoft.EntityFrameworkCore;
using database.Context;
using database.Entities;
using System.Linq.Expressions;

namespace database.Repositories;

public class PermissionRepository : IPermissionRepository
{
    private readonly PlanetContext _context;

    public PermissionRepository(PlanetContext context)
    {
        _context = context;
    }

    public async Task<Permission?> GetByIdAsync(int id)
    {
        return await _context.Permissions.FindAsync(id);
    }

    public async Task<Permission> CreateAsync(Permission permission)
    {
        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<Permission> UpdateAsync(Permission permission)
    {
        _context.Permissions.Update(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var permission = await _context.Permissions.FindAsync(id);
        if (permission == null) return false;
        
        _context.Permissions.Remove(permission);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Permission>> GetAllAsync()
    {
        return await _context.Permissions.ToListAsync();
    }

    public async Task<List<Permission>> Get(Expression<Func<Permission, bool>> exp)
    {
        return await _context.Permissions.Where(exp).ToListAsync();
    }

    public async Task<List<Permission>> GetByUserIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return new List<Permission>();

        return await _context.Permissions
            .Where(p => p.Role == user.Role && 
                       (p.PlanetId == null || p.PlanetId == user.AssignedPlanetId))
            .ToListAsync();
    }
}
