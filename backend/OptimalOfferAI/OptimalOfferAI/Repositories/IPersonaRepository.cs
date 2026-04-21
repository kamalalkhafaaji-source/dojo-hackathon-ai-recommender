using OptimalOfferAI.Models;

namespace OptimalOfferAI.Repositories;

public interface IPersonaRepository
{
    Task<IEnumerable<string>> GetPersonaKeysAsync();
    Task<RecommendationRequest?> GetPersonaAsync(string key);
}
