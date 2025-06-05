using database.Entities;

namespace database.Repositories;

public interface IEvaluationRepository
{
    Task<Evaluation?> GetByIdAsync(int id);
    Task<Evaluation> CreateAsync(Evaluation evaluation);
    Task<Evaluation> UpdateAsync(Evaluation evaluation);
    Task<bool> DeleteAsync(int id);
    Task<List<Evaluation>> GetAllAsync();
    Task<List<Evaluation>> GetByUserIdAsync(int userId);
}
