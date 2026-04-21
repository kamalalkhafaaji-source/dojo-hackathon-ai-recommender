using OptimalOfferAI.Models;
using OptimalOfferAI.Repositories;

namespace OptimalOfferAI.Services;

public interface IOfferOrchestrator
{
    Task<EnrichedRecommendationResponse?> GetEnrichedRecommendationsAsync(RecommendationsInput input);
}

public class OfferOrchestrator : IOfferOrchestrator
{
    private readonly IPersonaRepository _repository;
    private readonly GeminiRecommenderService _gemini;

    public OfferOrchestrator(IPersonaRepository repository, GeminiRecommenderService gemini)
    {
        _repository = repository;
        _gemini = gemini;
    }

    public async Task<EnrichedRecommendationResponse?> GetEnrichedRecommendationsAsync(RecommendationsInput input)
    {
        var keys = await _repository.GetPersonaKeysAsync();
        var personaKey = input.Persona ?? keys.FirstOrDefault();
        
        if (personaKey == null) return null;

        var fixture = await _repository.GetPersonaAsync(personaKey);
        if (fixture == null) return null;

        var request = fixture with { UserNeeds = input.UserNeeds };
        var result = await _gemini.GetRecommendationsAsync(request);

        if (result == null || result.Recommendations == null)
        {
            throw new Exception("AI service failed to return recommendations.");
        }

        if (fixture.Merchant?.BusinessProfile == null)
        {
            throw new Exception($"Persona data for '{personaKey}' is missing required merchant business profile information.");
        }

        return new EnrichedRecommendationResponse(
            result.Recommendations,
            fixture.Offers.ToDictionary(o => o.OfferId),
            new MerchantSummary(
                fixture.Merchant.BusinessProfile.TradingName ?? "Unknown Merchant", 
                fixture.Merchant.BusinessProfile.Industry ?? "Unknown Industry"
            )
        );
    }
}
