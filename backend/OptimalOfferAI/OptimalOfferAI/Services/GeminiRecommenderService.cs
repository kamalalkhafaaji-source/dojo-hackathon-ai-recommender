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
                            ["reasons"] = new Schema()
                            {
                                Type = Google.GenAI.Types.Type.Array,
                                Items = new Schema() { Type = Google.GenAI.Types.Type.String }
                            }
                        },
                        Required = new List<string> { "offerId", "rank", "headline", "reasons" }
                    }
                }
            },
            Required = new List<string> { "recommendations" }
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
                    model: "gemini-2.0-flash",
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
