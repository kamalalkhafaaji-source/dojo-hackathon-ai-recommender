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

        var eli5Instruction = request.IsELI5 
            ? "- **Explain Like I'm 5 (ELI5):** The user requested ELI5 mode. Use extremely simple language, everyday analogies (like 'a slice of a pizza' or 'a rainy day fund'), and ZERO financial jargon." 
            : "";

        var historyContext = request.ContextHistory != null && request.ContextHistory.Count > 0
            ? $"\nPREVIOUS CONVERSATION HISTORY:\n{string.Join("\n", request.ContextHistory.Select(h => $"- {h}"))}\nTake this history into account to provide a continuous, contextual response."
            : "";

        return $$"""
            You are an expert business finance advisor for small UK merchants.

            {{needsContext}}{{historyContext}}

            Given the merchant context and the full pool of eligible MCA (Merchant Cash Advance) offers below, select the **top 3 best-fit offers** and rank them 1–3.

            Rules:
            - **Chain of Thought:** First, write a brief 'chainOfThought' explaining your reasoning process for selecting and ranking these offers based on the merchant's context and needs.
            - **Dynamic Language Translation:** Detect the language of the merchant's feedback/needs. If it is NOT English, you MUST translate your entire response (headlines, tags, reasons, chainOfThought) into that language.
            - **Humanize & Personalize:** Speak directly to the merchant like a trusted, empathetic advisor ("you", "your business"). 
            - **Sentiment-Aware Tone:** If the merchant mentions a struggle, dip, or emergency, adopt a highly reassuring, protective tone. If they mention growth, expansion, or a competitor, adopt an enthusiastic, strategic tone.
            - **Local Event Correlation:** Invent or hypothesize a relevant upcoming local or industry event (e.g., "Summer festival season", "End-of-month payroll", "Holiday rush") that makes this funding perfectly timed.
            - **Competitive Side-by-Side:** If the merchant mentions a competitor's offer or a specific rate in their needs, explicitly compare the DOJO offer against it to show why DOJO is better.
            - **Bespoke Offer Names:** For each offer's `headline`, invent a creative, bespoke name for the plan instead of just "Funding Option". Examples: "The Espresso Upgrader", "Quiet Tuesday Buffer", "The Fast-Track Advance".
            - **Health Score:** Calculate a dynamic `healthScore` (1 to 100) representing how comfortable the repayment will be. A lower holdback % and longer term on a business with steady turnover should score high (90+). A high holdback on fluctuating turnover should score lower (70).
            - **Projected Cashflow:** Generate an array of 6 integers (`projectedCashflow`) representing a realistic 6-month projected monthly revenue curve (e.g., [10000, 10500, 11000, ...]) assuming they take this funding.
            - **Conversational Scannability:** Each reason should start with a unique, snappy 2-3 word summary followed by a colon.
            - **Unique Reasoning:** Ensure the reasons for each offer feel distinct and specific to that offer's data. Avoid using the same three categories for every card.
            - **Aggressive Highlighting:** You MUST wrap EVERY single number, amount, percentage, or currency in Markdown bold tags (e.g., **£15,000**, **12%**).
            - **Brevity:** Keep explanations focused and helpful. Total length for each reason should be around 15–20 words.
            {{eli5Instruction}}
            - Each recommendation MUST have exactly 3 reasons.
            - **Tag:** Generate a concise, 2-word phrase summarizing the primary benefit for this offer (e.g. "Best fit", "Growth focus", "Quick cash").
            - Return ONLY valid JSON matching this exact schema, with no extra text:

            {
              "chainOfThought": "string",
              "recommendations": [
                {
                  "offerId": "string",
                  "rank": 1,
                  "headline": "string",
                  "tag": "string",
                  "healthScore": 95,
                  "projectedCashflow": [10000, 10500, 11000, 12000, 11500, 12500],
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
