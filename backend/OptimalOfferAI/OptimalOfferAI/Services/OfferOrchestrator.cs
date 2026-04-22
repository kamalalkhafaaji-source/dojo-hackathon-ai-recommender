using OptimalOfferAI.Models;
using OptimalOfferAI.Repositories;
using Microsoft.Extensions.Caching.Memory;

namespace OptimalOfferAI.Services;

public interface IOfferOrchestrator
{
    Task<EnrichedRecommendationResponse?> GetEnrichedRecommendationsAsync(RecommendationsInput input);
}

public class OfferOrchestrator : IOfferOrchestrator
{
    private readonly IPersonaRepository _repository;
    private readonly GeminiRecommenderService _gemini;
    private readonly IMemoryCache _cache;

    public OfferOrchestrator(IPersonaRepository repository, GeminiRecommenderService gemini, IMemoryCache cache)
    {
        _repository = repository;
        _gemini = gemini;
        _cache = cache;
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

        // Memory Cache Logic
        List<string> contextHistory = new();
        if (!string.IsNullOrEmpty(input.SessionId))
        {
            if (_cache.TryGetValue(input.SessionId, out List<string>? cachedHistory) && cachedHistory != null)
            {
                contextHistory = cachedHistory;
            }
            if (!string.IsNullOrWhiteSpace(input.UserNeeds))
            {
                contextHistory.Add(input.UserNeeds);
                _cache.Set(input.SessionId, contextHistory, TimeSpan.FromHours(1));
            }
        }

        var request = fixture with { 
            UserNeeds = input.UserNeeds, 
            IsELI5 = input.IsELI5,
            ContextHistory = contextHistory.Count > 0 ? contextHistory : null 
        };

        // Use more attempts for refinement requests since the user has expressed specific needs
        var isRefinement = !string.IsNullOrWhiteSpace(input.UserNeeds);
        var maxAttempts = isRefinement ? 3 : 2;

        var result = await _gemini.GetRecommendationsAsync(request, maxAttempts);

        // If AI service fails, generate fallback recommendations based on highest funding amount
        List<Recommendation> recommendations;
        List<SuggestedRefinement> suggestions = new();
        string chainOfThought = "N/A";
        string? aiWarning = null;

        bool isFallback = false;
        if (result == null || result.Recommendations == null || result.Recommendations.Count == 0)
        {
            Console.WriteLine($"AI service unavailable. Generating fallback recommendations for {personaKey}.");
            recommendations = GenerateFallbackRecommendations(fixture.Offers);
            suggestions = new List<SuggestedRefinement> {
                new("I'm a bit nervous about the cost—can you explain how this fits my actual daily sales?", "I'm a bit nervous about the cost—can you explain how this fits my actual daily sales?"),
                new("I'm ready to grow! Show me the most aggressive funding options for expansion.", "I'm ready to grow! Show me the most aggressive funding options for expansion."),
                new("I'm just exploring right now. How would these offers help if I have a slow month?", "I'm just exploring right now. How would these offers help if I have a slow month?"),
                new("I'm feeling a bit cautious. Could you show me some smaller, lower-risk offers first?", "I'm feeling a bit cautious. Could you show me some smaller, lower-risk offers first?")
            };

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
            suggestions = result.SuggestedRefinements ?? new();
            chainOfThought = result.ChainOfThought ?? "N/A";
        }

        return new EnrichedRecommendationResponse(
            chainOfThought,
            recommendations,
            fixture.Offers.ToDictionary(o => o.OfferId),
            new MerchantSummary(
                fixture.Merchant.BusinessProfile.TradingName ?? "Unknown Merchant",
                fixture.Merchant.BusinessProfile.Industry ?? "Unknown Industry"
            ),
            suggestions,
            aiWarning,
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
                Headline: $"Funding Option {rank}: £{offer.FundingAmount:F0}",
                Reasons: reasons,
                Tag: rank == 1 ? "Best fit" : rank == 2 ? "2nd" : "3rd",
                HealthScore: rank == 1 ? 85 : rank == 2 ? 75 : 65
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
