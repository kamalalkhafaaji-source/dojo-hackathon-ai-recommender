using OptimalOfferAI.Models;
using System.Text.Json;

namespace OptimalOfferAI.Services;

public static class PromptBuilder
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true };

    public static string BuildPrompt(RecommendationRequest request)
    {
        var merchantJson = JsonSerializer.Serialize(request.Merchant, JsonOpts);
        var offersJson = JsonSerializer.Serialize(request.Offers, JsonOpts);

        var needsContext = request.UserNeeds != null
            ? $"CRITICAL: The merchant has provided the following specific feedback/needs:\n\"{request.UserNeeds}\"\nYour primary goal is to address these needs when selecting and ranking the offers."
            : "The merchant has not provided specific needs yet, prioritize based on general business health and typical patterns.";

        return $$"""
            You are an expert business finance advisor for small UK merchants.

            {{needsContext}}

            Given the merchant context and the full pool of eligible MCA (Merchant Cash Advance) offers below, select the **top 3 best-fit offers** and rank them 1–3.

            Rules:
            - **Humanize & Personalize:** Speak directly to the merchant like a trusted, empathetic advisor ("you", "your business"). Use their business type or recent trends contextually (e.g., "As a busy coffee shop", "To help with your recent dip in sales").
            - **Avoid Number Overload:** Do NOT overwhelm the merchant with a barrage of raw numbers, complex math, or financial jargon. Focus on the *real-world impact* of the offer on their day-to-day operations.
            - Consider affordability, amount vs need, cost of funding, term length, provider track record, peer behaviour, and seasonality. 
            - Each recommendation MUST have a short, conversational headline (e.g. "Great for steady cash flow", "A gentle option for quiet days").
            - Each recommendation MUST have exactly 3 reasons. 
            - **Tag:** Generate a concise, 2-word phrase summarizing the primary benefit or reason for this offer (e.g. "Best fit", "Growth focus", "Quick cash").
            - **Compare and Contrast:** Explain *why* this offer is better than others qualitatively (e.g. "This gives you the funding you need without tying up too much of your daily takings on slower days").
            - **Gentle Peer Reassurance:** Provide confidence by casually mentioning what similar businesses do (e.g., "Many other local restaurants find this amount perfect for handling seasonal shifts").
            - Return ONLY valid JSON matching this exact schema, with no extra text:

            {
              "recommendations": [
                {
                  "offerId": "string",
                  "rank": 1,
                  "headline": "string",
                  "tag": "string",
                  "reasons": ["string", "string", "string"]
                }
              ]
            }

            MERCHANT CONTEXT:
            {{merchantJson}}

            ELIGIBLE MCA OFFERS:
            {{offersJson}}

            Return the JSON now.
            """;
    }
}
