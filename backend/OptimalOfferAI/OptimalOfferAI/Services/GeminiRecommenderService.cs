using System.Text.Json;
using Microsoft.Extensions.Options;
using Google.GenAI;
using Google.GenAI.Types;
using OptimalOfferAI.Models;

namespace OptimalOfferAI.Services;

public class GeminiRecommenderService
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true };

    public GeminiRecommenderService(IOptions<GeminiOptions> options)
    {
        _options = options.Value;
    }

    private readonly GeminiOptions _options;

    public async Task<RecommendationResponse?> GetRecommendationsAsync(RecommendationRequest request, int maxAttempts = 2)
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("WARNING: Gemini API Key is missing. Returning null to allow fallback to basic recommendations.");
            return null;
        }

        var client = new Client(apiKey: apiKey);

        // ...schema/config setup unchanged...
        var schema = new Schema()
        {
            Type = Google.GenAI.Types.Type.Object,
            Properties = new Dictionary<string, Schema>()
            {
                ["chainOfThought"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                ["recommendations"] = new Schema()
                {
                    Type = Google.GenAI.Types.Type.Array,
                    Items = new Schema()
                    {
                        Type = Google.GenAI.Types.Type.Object,
                        Properties = new Dictionary<string, Schema>()
                        {
                            ["offerId"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                            ["rank"] = new Schema() { Type = Google.GenAI.Types.Type.Integer },
                            ["headline"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                            ["tag"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                            ["healthScore"] = new Schema() { Type = Google.GenAI.Types.Type.Integer },
                            ["projectedCashflow"] = new Schema()
                            {
                                Type = Google.GenAI.Types.Type.Array,
                                Items = new Schema() { Type = Google.GenAI.Types.Type.Number }
                            },
                            ["reasons"] = new Schema()
                            {
                                Type = Google.GenAI.Types.Type.Array,
                                Items = new Schema() { Type = Google.GenAI.Types.Type.String }
                            }
                        },
                        Required = new List<string> { "offerId", "rank", "headline", "tag", "healthScore", "projectedCashflow", "reasons" }
                    }
                }
            },
            Required = new List<string> { "chainOfThought", "recommendations" }
        };

        var config = new GenerateContentConfig()
        {
            ResponseMimeType = "application/json",
            ResponseSchema = schema
        };

        var prompt = PromptBuilder.BuildPrompt(request);

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                Console.WriteLine($"Gemini API: sending request (attempt {attempt}/{maxAttempts})...");
                var response = await client.Models.GenerateContentAsync(
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: config
                );

                if (response != null)
                {
                    Console.WriteLine($"Gemini API: attempt {attempt} succeeded.");
                    return ParseResponse(response);
                }

                Console.WriteLine($"Gemini API returned null on attempt {attempt}.");
            }
            catch (Exception ex)
            {
                var is429 = ex.Message.Contains("429") || ex.Message.Contains("TooManyRequests") || ex.Message.Contains("quota");
                Console.WriteLine($"Gemini API error on attempt {attempt}/{maxAttempts} [{(is429 ? "429 RATE LIMITED" : ex.GetType().Name)}]: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"  Inner exception: {ex.InnerException.GetType().Name} - {ex.InnerException.Message}");
            }

            if (attempt < maxAttempts)
                Console.WriteLine($"Retrying... ({attempt}/{maxAttempts - 1} retries used)");
        }

        Console.WriteLine($"Gemini API failed after {maxAttempts} attempt(s). Returning null for fallback.");
        return null;
    }

    public async Task<string> SimulateImpactAsync(string offerDetails, string merchantContext, string userWhatIf)
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey)) return "Simulated response: If revenue drops, this repayment becomes slightly tighter, but the long term offers flexibility.";

        var client = new Client(apiKey: apiKey);
        var prompt = $"You are a financial advisor. Merchant context: {merchantContext}. Offer: {offerDetails}. The merchant asks: \"{userWhatIf}\". Reply conversationally in 2-3 sentences analyzing the impact.";
        var response = await client.Models.GenerateContentAsync(model: "gemini-2.5-flash", contents: prompt);
        return response.Text ?? "Could not generate simulation.";
    }

    public async Task<string> GetDeepDiveAsync(string reason, string offerDetails)
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey)) return "Deep dive: This reason highlights the core value of the offer in relation to typical business cash flow needs.";

        var client = new Client(apiKey: apiKey);
        var prompt = $"You are a financial advisor. A merchant wants to know more about this specific reason: \"{reason}\" for the following offer: {offerDetails}. Provide a 3-4 sentence detailed explanation of why this makes sense.";
        var response = await client.Models.GenerateContentAsync(model: "gemini-2.5-flash", contents: prompt);
        return response.Text ?? "Could not generate deep dive.";
    }

    public async Task<string> SuggestRefinementAsync(string merchantContext)
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey)) return "I need at least £10,000 to manage inventory over the next few quiet days.";

        var client = new Client(apiKey: apiKey);
        var prompt = $"You are a merchant with this profile: {merchantContext}. Write a single sentence (10-15 words) expressing what you might need right now regarding funding. Be specific (e.g., 'I need £X for Y because of Z').";
        var response = await client.Models.GenerateContentAsync(model: "gemini-2.5-flash", contents: prompt);
        return response.Text?.Replace("\"", "") ?? "Could not suggest refinement.";
    }

    public async Task<string[]> GenerateFaqAsync(string offerDetails, string merchantContext)
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey)) return new[] { "What is the repayment term? Varies by sales.", "How is it collected? Automatically from daily sweep." };

        var client = new Client(apiKey: apiKey);
        
        var schema = new Schema()
        {
            Type = Google.GenAI.Types.Type.Array,
            Items = new Schema() { Type = Google.GenAI.Types.Type.String }
        };

        var config = new GenerateContentConfig()
        {
            ResponseMimeType = "application/json",
            ResponseSchema = schema
        };

        var prompt = $"Generate 3 personalized FAQs (Question and short Answer in one string, e.g., 'Q: ...? A: ...') for this merchant taking this offer. Merchant: {merchantContext}. Offer: {offerDetails}.";
        
        var response = await client.Models.GenerateContentAsync(model: "gemini-2.5-flash", contents: prompt, config: config);
        var text = response.Text?.Trim() ?? "[]";
        if (text.StartsWith("```"))
        {
            var firstNewline = text.IndexOf('\n');
            text = text[(firstNewline + 1)..];
            if (text.EndsWith("```")) text = text[..^3];
            text = text.Trim();
        }

        try {
            return JsonSerializer.Deserialize<string[]>(text, JsonOpts) ?? new string[0];
        } catch {
            return new string[0];
        }
    }

    public async Task<RecommendationRequest?> GenerateDynamicPersonaAsync()
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey)) return null;

        var client = new Client(apiKey: apiKey);
        var schema = new Schema()
        {
            Type = Google.GenAI.Types.Type.Object,
            Properties = new Dictionary<string, Schema>()
            {
                ["merchant"] = new Schema()
                {
                    Type = Google.GenAI.Types.Type.Object,
                    Properties = new Dictionary<string, Schema>()
                    {
                        ["businessProfile"] = new Schema()
                        {
                            Type = Google.GenAI.Types.Type.Object,
                            Properties = new Dictionary<string, Schema>()
                            {
                                ["tradingName"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                                ["industry"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                                ["mcc"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                                ["monthsTrading"] = new Schema() { Type = Google.GenAI.Types.Type.Integer }
                            }
                        },
                        ["cardTurnover"] = new Schema()
                        {
                            Type = Google.GenAI.Types.Type.Object,
                            Properties = new Dictionary<string, Schema>()
                            {
                                ["annualizedTurnover"] = new Schema() { Type = Google.GenAI.Types.Type.Number },
                                ["averageTicketValue"] = new Schema() { Type = Google.GenAI.Types.Type.Number },
                                ["trend12mPct"] = new Schema() { Type = Google.GenAI.Types.Type.Number }
                            }
                        },
                        ["cashFlowSignals"] = new Schema()
                        {
                            Type = Google.GenAI.Types.Type.Object,
                            Properties = new Dictionary<string, Schema>()
                            {
                                ["quietDays"] = new Schema() { Type = Google.GenAI.Types.Type.Array, Items = new Schema() { Type = Google.GenAI.Types.Type.String } },
                                ["recentDips"] = new Schema() { Type = Google.GenAI.Types.Type.Boolean }
                            }
                        },
                        ["peerSignals"] = new Schema()
                        {
                            Type = Google.GenAI.Types.Type.Object,
                            Properties = new Dictionary<string, Schema>()
                            {
                                ["segmentGrowthPct"] = new Schema() { Type = Google.GenAI.Types.Type.Number },
                                ["typicalTermDays"] = new Schema() { Type = Google.GenAI.Types.Type.Integer }
                            }
                        }
                    }
                },
                ["offers"] = new Schema()
                {
                    Type = Google.GenAI.Types.Type.Array,
                    Items = new Schema()
                    {
                        Type = Google.GenAI.Types.Type.Object,
                        Properties = new Dictionary<string, Schema>()
                        {
                            ["offerId"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                            ["provider"] = new Schema() { Type = Google.GenAI.Types.Type.String },
                            ["fundingAmount"] = new Schema() { Type = Google.GenAI.Types.Type.Number },
                            ["repaymentAmount"] = new Schema() { Type = Google.GenAI.Types.Type.Number },
                            ["holdbackPercentage"] = new Schema() { Type = Google.GenAI.Types.Type.Number },
                            ["daysUntilRepayment"] = new Schema() { Type = Google.GenAI.Types.Type.Integer },
                            ["expirationDate"] = new Schema() { Type = Google.GenAI.Types.Type.String }
                        }
                    }
                }
            }
        };

        var config = new GenerateContentConfig()
        {
            ResponseMimeType = "application/json",
            ResponseSchema = schema
        };

        var prompt = "Generate a realistic but entirely fictional UK small business profile (e.g., a bakery, mechanic, or florist) along with 3 realistic Merchant Cash Advance (MCA) offers tailored to them. Output strict JSON matching the schema.";
        var response = await client.Models.GenerateContentAsync(model: "gemini-2.5-flash", contents: prompt, config: config);
        
        var text = response.Text?.Trim() ?? "";
        if (text.StartsWith("```"))
        {
            var firstNewline = text.IndexOf('\n');
            text = text[(firstNewline + 1)..];
            if (text.EndsWith("```")) text = text[..^3];
            text = text.Trim();
        }

        return JsonSerializer.Deserialize<RecommendationRequest>(text, JsonOpts);
    }

    private static RecommendationResponse? ParseResponse(GenerateContentResponse response)
    {
        var text = response.Text;
        if (string.IsNullOrEmpty(text))
        {
            Console.WriteLine("Gemini API returned empty response. Returning null for fallback.");
            return null;
        }

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

        var result = JsonSerializer.Deserialize<RecommendationResponse>(text, JsonOpts);
        if (result == null)
            Console.WriteLine("Failed to deserialize Gemini response. Returning null for fallback.");

        return result;
    }
}
