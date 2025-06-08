using database.Enums;

namespace api.Models.DTOs;

public class CreatePlanetRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime DiscoveredDate { get; set; }
}

public class UpdatePlanetRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public PlanetStatus Status { get; set; }
}

public class AddFactorRequest
{
    public string FactorName { get; set; } = string.Empty;
    public FactorCategory Category { get; set; }
    public object Value { get; set; } = new();
    public string Unit { get; set; } = string.Empty;
    public FactorType DataType { get; set; }
    public double Weight { get; set; } = 1.0;
    public string Description { get; set; } = string.Empty;
}

public class UpdateFactorRequest
{
    public string FactorName { get; set; } = string.Empty;
    public FactorCategory Category { get; set; }
    public object Value { get; set; } = new();
    public string Unit { get; set; } = string.Empty;
    public FactorType DataType { get; set; }
    public double Weight { get; set; } = 1.0;
    public string Description { get; set; } = string.Empty;
}

public class EvaluationRequest
{
    public List<int> PlanetIds { get; set; } = new();
    public EvaluationAlgorithm Algorithm { get; set; }
    public Dictionary<string, double> Weights { get; set; } = new();
}
