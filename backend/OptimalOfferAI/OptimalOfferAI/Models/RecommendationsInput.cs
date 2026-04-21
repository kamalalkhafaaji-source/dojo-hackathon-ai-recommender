namespace OptimalOfferAI.Models;

/// <summary>
/// The input request for generating recommendations.
/// </summary>
public record RecommendationsInput(
    string? Persona = null, 
    string? UserNeeds = null
);
