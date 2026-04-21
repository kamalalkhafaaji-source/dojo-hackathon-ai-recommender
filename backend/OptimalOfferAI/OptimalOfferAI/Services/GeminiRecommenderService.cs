using System.Text.Json;
using Mscc.GenerativeAI;
using OptimalOfferAI.Models;

namespace OptimalOfferAI.Services;

public class GeminiRecommenderService
{
    private readonly GenerativeModel _model;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true };

    public GeminiRecommenderService(IConfiguration config)
    {
        var apiKey = config["Gemini:ApiKey"] ?? throw new InvalidOperationException("Set Gemini:ApiKey in config or GEMINI_API_KEY env var.");
        var googleAi = new GoogleAI(apiKey);
        _model = googleAi.GenerativeModel(model: "gemini-2.0-flash");
        _model.UseJsonMode = true;
    }

    public async Task<RecommendationResponse> GetRecommendationsAsync(RecommendationRequest request)
    {
        var prompt = BuildPrompt(request);

        // Retry up to 3 times on rate-limit errors
        GenerateContentResponse? response = null;
        for (var attempt = 0; attempt < 3; attempt++)
        {
            try
            {
                response = await _model.GenerateContent(prompt);
                break;
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("429") || ex.Message.Contains("TooManyRequests"))
            {
                if (attempt == 2) throw;
                await Task.Delay(TimeSpan.FromSeconds(5 * (attempt + 1)));
            }
        }

        var text = response!.Text ?? throw new Exception("Empty Gemini response");

        // Strip markdown fences if present
        text = text.Trim();
        if (text.StartsWith("```"))
        {
            var firstNewline = text.IndexOf('\n');
            text = text[(firstNewline + 1)..];
            if (text.EndsWith("```"))
                text = text[..^3];
            text = text.Trim();
        }

        var result = JsonSerializer.Deserialize<RecommendationResponse>(text, JsonOpts)
                     ?? throw new Exception("Failed to parse Gemini response");
        return result;
    }

    private static string BuildPrompt(RecommendationRequest request)
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
            - Consider affordability (holdback % vs cash-flow), amount vs need, cost of funding, term length, provider track record, peer behaviour, and seasonality. Focus on soft ratios and affordability (e.g., "A 10% sweep is comfortable given your steady turnover") rather than calculating exact daily amounts.
            - Each recommendation MUST have a short, friendly headline written for the merchant (e.g. "Best if you have a big spend coming up", "Lowest cost option for a quick top-up", "Keeps your daily cash flow comfortable").
            - Each recommendation MUST have exactly 3 reasons. 
            - Reasons should be written in plain English directly to the merchant ("you", "your") and reference concrete numbers from the data (amounts, percentages, days, trends). No generic marketing copy.
            - **Compare and Contrast:** Explain *why this offer is better than alternatives*. (e.g. "This offers a lower fee compared to other options, while still covering your seasonal inventory costs").
            - **Peer Pressure:** Always try to include one reason that compares the offer to typical funding taken by similar businesses in their segment, anchoring to real peer behaviour.
            - Return ONLY valid JSON matching this exact schema, with no extra text:

            {
              "recommendations": [
                {
                  "offerId": "string",
                  "rank": 1,
                  "headline": "string",
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




