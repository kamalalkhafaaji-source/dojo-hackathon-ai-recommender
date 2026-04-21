namespace OptimalOfferAI.Models;

public record RecommendationResponse(
    List<Recommendation> Recommendations
);

public record Recommendation(
    string OfferId,
    int Rank,
    string Headline,
    List<string> Reasons,
    string? Tag = null
);

