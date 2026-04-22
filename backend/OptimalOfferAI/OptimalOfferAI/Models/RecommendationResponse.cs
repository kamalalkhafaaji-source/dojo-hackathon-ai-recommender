namespace OptimalOfferAI.Models;

public record RecommendationResponse(
    string ChainOfThought,
    List<Recommendation> Recommendations
);

public record Recommendation(
    string OfferId,
    int Rank,
    string Headline,
    List<string> Reasons,
    string? Tag = null,
    int HealthScore = 0,
    List<decimal>? ProjectedCashflow = null
);

