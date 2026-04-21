using OptimalOfferAI.Models;
using System.Text.Json;

namespace OptimalOfferAI.Repositories;

public class FileBasedPersonaRepository : IPersonaRepository
{
    private readonly Dictionary<string, RecommendationRequest> _personas;

    public FileBasedPersonaRepository()
    {
        var jsonOpts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var fixturesDir = Path.Combine(AppContext.BaseDirectory, "Fixtures");
        if (!Directory.Exists(fixturesDir))
            fixturesDir = Path.Combine(Directory.GetCurrentDirectory(), "Fixtures");

        _personas = new Dictionary<string, RecommendationRequest>(StringComparer.OrdinalIgnoreCase);
        if (Directory.Exists(fixturesDir))
        {
            foreach (var file in Directory.GetFiles(fixturesDir, "*.json"))
            {
                var json = File.ReadAllText(file);
                var data = JsonSerializer.Deserialize<RecommendationRequest>(json, jsonOpts)!;
                var name = Path.GetFileNameWithoutExtension(file);
                _personas[name] = data;
            }
        }
    }

    public Task<IEnumerable<string>> GetPersonaKeysAsync()
    {
        return Task.FromResult((IEnumerable<string>)_personas.Keys);
    }

    public Task<RecommendationRequest?> GetPersonaAsync(string key)
    {
        _personas.TryGetValue(key, out var persona);
        return Task.FromResult(persona);
    }
}
