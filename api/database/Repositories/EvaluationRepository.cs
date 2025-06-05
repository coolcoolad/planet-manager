using Microsoft.EntityFrameworkCore;
using database.Context;
using database.Entities;

namespace database.Repositories;

public class EvaluationRepository : IEvaluationRepository
{
    private readonly PlanetContext _context;

    public EvaluationRepository(PlanetContext context)
    {
        _context = context;
    }

    public async Task<Evaluation?> GetByIdAsync(int id)
    {
        return await _context.Evaluations.FindAsync(id);
    }

    public async Task<Evaluation> CreateAsync(Evaluation evaluation)
    {
        _context.Evaluations.Add(evaluation);
        await _context.SaveChangesAsync();
        return evaluation;
    }

    public async Task<Evaluation> UpdateAsync(Evaluation evaluation)
    {
        _context.Evaluations.Update(evaluation);
        await _context.SaveChangesAsync();
        return evaluation;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var evaluation = await _context.Evaluations.FindAsync(id);
        if (evaluation == null) return false;
        
        _context.Evaluations.Remove(evaluation);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Evaluation>> GetAllAsync()
    {
        return await _context.Evaluations.ToListAsync();
    }

    public async Task<List<Evaluation>> GetByUserIdAsync(int userId)
    {
        return await _context.Evaluations
            .Where(e => e.CreatedByUserId == userId)
            .ToListAsync();
    }
}
