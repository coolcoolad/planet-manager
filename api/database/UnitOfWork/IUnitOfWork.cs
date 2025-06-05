using database.Repositories;

namespace database.UnitOfWork;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IPlanetRepository Planets { get; }
    IPlanetFactorRepository PlanetFactors { get; }
    IEvaluationRepository Evaluations { get; }
    IPermissionRepository Permissions { get; }
    
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
    Task<int> SaveChangesAsync();
}
