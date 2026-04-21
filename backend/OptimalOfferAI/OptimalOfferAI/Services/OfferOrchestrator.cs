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

        if (fixture.Merchant?.BusinessProfile == null)
        {
            throw new Exception($"Persona data for '{personaKey}' is missing required merchant business profile information.");
        }

        var request = fixture with { UserNeeds = input.UserNeeds };

        // Use more attempts for refinement requests since the user has expressed specific needs
        var isRefinement = !string.IsNullOrWhiteSpace(input.UserNeeds);
        var maxAttempts = isRefinement ? 3 : 2;

        var result = await _gemini.GetRecommendationsAsync(request, maxAttempts);

        // If AI service fails, generate fallback recommendations based on highest funding amount
        List<Recommendation> recommendations;
        string? aiWarning = null;

        bool isFallback = false;
        if (result == null || result.Recommendations == null || result.Recommendations.Count == 0)
        {
            Console.WriteLine($"AI service unavailable. Generating fallback recommendations for {personaKey}.");
            recommendations = GenerateFallbackRecommendations(fixture.Offers);

            if (isRefinement)
            {
                aiWarning = "We weren't able to tailor these offers to your specific request right now. " +
                            "We're showing our top offers by funding amount instead. " +
                            "Please try refining again in a moment.";
            }
            isFallback = true;
        }
        else
        {
            recommendations = result.Recommendations;
        }

        return new EnrichedRecommendationResponse(
            recommendations,
            fixture.Offers.ToDictionary(o => o.OfferId),
            new MerchantSummary(
                fixture.Merchant.BusinessProfile.TradingName ?? "Unknown Merchant",
                fixture.Merchant.BusinessProfile.Industry ?? "Unknown Industry"
            ),
            aiWarning
            IsFallback: isFallback
        );
    }

    /// <summary>
    /// Generates fallback recommendations when the AI service is unavailable.
    /// Returns the top 3 offers sorted by funding amount (highest first).
    /// </summary>
    private static List<Recommendation> GenerateFallbackRecommendations(List<McaOffer> offers)
    {
        if (offers == null || offers.Count == 0)
        {
            return new List<Recommendation>();
        }

        // Sort by funding amount descending and take top 3
        var topOffers = offers
            .OrderByDescending(o => o.FundingAmount)
            .Take(3)
            .ToList();

        var recommendations = new List<Recommendation>();
        for (int i = 0; i < topOffers.Count; i++)
        {
            var offer = topOffers[i];
            var rank = i + 1;
            
            // Generate simple generic reasons based on offer characteristics
            var reasons = GenerateFallbackReasons(offer, rank);
            
            recommendations.Add(new Recommendation(
                OfferId: offer.OfferId,
                Rank: rank,
                Headline: $"Funding Option {rank}: ${offer.FundingAmount:F0}",
                Reasons: reasons,
                Tag: rank == 1 ? "Best fit" : rank == 2 ? "2nd" : "3rd"
            ));
        }

        return recommendations;
    }

    /// <summary>
    /// Generates generic reasons for a fallback recommendation based on offer details.
    /// </summary>
    private static List<string> GenerateFallbackReasons(McaOffer offer, int rank)
    {
        var reasons = new List<string>();

        if (rank == 1)
        {
            reasons.Add($"Highest funding amount available: £{offer.FundingAmount:F0}");
        }
        else if (rank == 2)
        {
            reasons.Add($"Strong funding option: £{offer.FundingAmount:F0}");
        }
        else
        {
            reasons.Add($"Alternative funding option: £{offer.FundingAmount:F0}");
        }

        if (offer.HoldbackPercentage < 12)
        {
            reasons.Add("Competitive daily sales holdback percentage");
        }
        else if (offer.HoldbackPercentage < 15)
        {
            reasons.Add("Moderate daily sales holdback percentage");
        }
        else
        {
            reasons.Add("Higher funding with daily sales holdback");
        }

        if (offer.DaysUntilRepayment > 250)
        {
            reasons.Add("Extended repayment timeline for better cash flow management");
        }
        else if (offer.DaysUntilRepayment > 200)
        {
            reasons.Add("Reasonable repayment timeline");
        }
        else
        {
            reasons.Add("Shorter repayment term with lower overall cost");
        }

        // Ensure we have at least 2 reasons
        while (reasons.Count < 2 && reasons.Count < 3)
        {
            reasons.Add("Reputable funding provider");
        }

        return reasons.Take(3).ToList();
    }
}
