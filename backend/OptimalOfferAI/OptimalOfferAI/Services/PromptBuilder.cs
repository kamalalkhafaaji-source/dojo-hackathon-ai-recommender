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
            - **Conversational Scannability:** Blend warm, empathetic language with the "Action: Description" format. Each reason should start with a snappy summary (e.g., "Protect your cashflow:", "Cover your spend:", "Join local peers:") but follow with a friendly, helpful explanation.
            - **Predictable Categorization:** Always provide exactly 3 reasons in this exact order: 1. Affordability/Cashflow, 2. Strategic/Business Fit, 3. Peer Reassurance.
            - **Aggressive Highlighting:** You MUST wrap EVERY single number, amount, percentage, or currency in Markdown bold tags (e.g., **£15,000**, **12%**, **250 days**, **£50/day**). This is critical for scannability.
            - **Brevity:** Keep explanations focused and helpful. Total length for each reason should be around 15–20 words.
            - Each recommendation MUST have a short, conversational headline (e.g. "Great for steady cash flow", "A gentle option for quiet days").
            - **Tag:** Generate a concise, 2-word phrase summarizing the primary benefit for this offer (e.g. "Best fit", "Growth focus", "Quick cash").
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
