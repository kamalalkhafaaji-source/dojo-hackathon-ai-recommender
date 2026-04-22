namespace OptimalOfferAI.Models;

public record EnrichedRecommendationResponse(
    string ChainOfThought,
    List<Recommendation> Recommendations,
    Dictionary<string, McaOffer> Offers,
    MerchantSummary Merchant,
    List<SuggestedRefinement> SuggestedRefinements,
    string? AiWarning = null,
    bool IsFallback = false
);

public record SuggestedRefinement(
    string Label,
    string Prompt
);

public record MerchantSummary(
    string TradingName,
    string Industry
);
