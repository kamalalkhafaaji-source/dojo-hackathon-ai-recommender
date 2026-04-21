namespace OptimalOfferAI.Models;

public record EnrichedRecommendationResponse(
    List<Recommendation> Recommendations,
    Dictionary<string, McaOffer> Offers,
    MerchantSummary Merchant
);

public record MerchantSummary(
    string TradingName,
    string Industry
);
