namespace OptimalOfferAI.Models;

public record EnrichedRecommendationResponse(
    List<Recommendation> Recommendations,
    Dictionary<string, McaOffer> Offers,
    MerchantSummary Merchant,
    string? AiWarning = null
);

public record MerchantSummary(
    string TradingName,
    string Industry
);
