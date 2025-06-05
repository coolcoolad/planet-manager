using Microsoft.EntityFrameworkCore.Storage;
using database.Context;
using database.Repositories;

namespace database.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly PlanetContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(PlanetContext context)
    {
        _context = context;
        Users = new UserRepository(_context);
        Planets = new PlanetRepository(_context);
        PlanetFactors = new PlanetFactorRepository(_context);
        Evaluations = new EvaluationRepository(_context);
        Permissions = new PermissionRepository(_context);
    }

    public IUserRepository Users { get; }
    public IPlanetRepository Planets { get; }
    public IPlanetFactorRepository PlanetFactors { get; }
    public IEvaluationRepository Evaluations { get; }
    public IPermissionRepository Permissions { get; }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
