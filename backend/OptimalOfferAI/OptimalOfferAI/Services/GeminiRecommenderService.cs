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

    public async Task<RecommendationResponse> GetRecommendationsAsync(RecommendationRequest request)
    {
        var apiKey = _options.ApiKey;
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable.");
        }

        var client = new Client(apiKey: apiKey);

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

        // Retry up to 3 times on rate-limit errors
        GenerateContentResponse? response = null;
        for (var attempt = 0; attempt < 3; attempt++)
        {
            try
            {
                response = await client.Models.GenerateContentAsync(
                    model: "gemini-2.0-flash",
                    contents: prompt,
                    config: config
                );
                break;
            }
            catch (Exception ex) when (ex.Message.Contains("429") || ex.Message.Contains("TooManyRequests") || ex.Message.Contains("quota"))
            {
                if (attempt == 2) throw;
                await Task.Delay(TimeSpan.FromSeconds(5 * (attempt + 1)));
            }
        }

        var text = response?.Text ?? throw new Exception("Empty Gemini response");

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
}
